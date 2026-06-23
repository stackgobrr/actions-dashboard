#!/usr/bin/env bash
set -euo pipefail

BUCKET="${LAMBDA_S3_BUCKET:?LAMBDA_S3_BUCKET must be set}"
COMMIT_SHA="${COMMIT_SHA:?COMMIT_SHA must be set}"
MANIFEST_KEY="${MANIFEST_KEY:-manifests/lambda-manifest.json}"

LAMBDAS=(oauth-start oauth-callback profile groups webhook-receiver token-proxy event-stream)

declare -A S3_KEYS
ROOT_DIR="$(pwd)"
SHARED_DIR="${ROOT_DIR}/lambdas/shared"
ARTIFACT_DIR="${ROOT_DIR}/lambdas/.artifacts"

mkdir -p "${ARTIFACT_DIR}"

cleanup() {
  for fn in "${LAMBDAS[@]}"; do
    rm -rf "${ROOT_DIR}/lambdas/${fn}/shared"
  done
}

trap cleanup EXIT

for fn in "${LAMBDAS[@]}"; do
  dir="${ROOT_DIR}/lambdas/${fn}"
  zip_file="${ARTIFACT_DIR}/${fn}.zip"

  echo "📦 Building ${fn}..."

  (
    cd "${dir}"
    npm ci --omit=dev || npm install --omit=dev
  )

  rm -rf "${dir}/shared"
  cp -r "${SHARED_DIR}" "${dir}/shared"

  rm -f "${zip_file}"
  (
    cd "${dir}"
    zip -qr "${zip_file}" . -x "*.test.*" "*.spec.*"
  )

  s3_key="lambdas/${COMMIT_SHA}/${fn}.zip"
  aws s3 cp "${zip_file}" "s3://${BUCKET}/${s3_key}"
  S3_KEYS["${fn}"]="s3://${BUCKET}/${s3_key}"
done

manifest_path="${ARTIFACT_DIR}/lambda-manifest.json"

for fn in "${LAMBDAS[@]}"; do
  var_name="S3_KEY_${fn//-/_}"
  export "${var_name^^}=${S3_KEYS[$fn]}"
done

python3 - "${COMMIT_SHA}" "${manifest_path}" "${LAMBDAS[@]}" <<'PY'
import json
import os
import sys

commit_sha = sys.argv[1]
manifest_path = sys.argv[2]
lambda_names = sys.argv[3:]

try:
    manifest = {
        "commit_sha": commit_sha,
        "lambdas": {
            name: {"package": os.environ[f"S3_KEY_{name.replace('-', '_').upper()}"]}
            for name in lambda_names
        },
    }
except KeyError as exc:
    raise SystemExit(f"Missing manifest environment variable: {exc.args[0]}") from exc

try:
    with open(manifest_path, "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=2)
        fh.write("\n")
except OSError as exc:
    raise SystemExit(f"Failed to write manifest to {manifest_path}: {exc}") from exc
PY

aws s3 cp "${manifest_path}" "s3://${BUCKET}/${MANIFEST_KEY}"
echo "✅ Manifest uploaded to s3://${BUCKET}/${MANIFEST_KEY}"
