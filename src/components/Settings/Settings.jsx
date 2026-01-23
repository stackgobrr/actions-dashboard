import { useState, useEffect } from 'react'
import { XIcon, SearchIcon, PlusIcon, TrashIcon } from '@primer/octicons-react'
import { Button, IconButton, TextInput } from '@primer/react'
import './Settings.css'

export function Settings({ onClose, getActiveToken, authMethod, selectedRepos, onSaveRepos }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [availableRepos, setAvailableRepos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [repos, setRepos] = useState(selectedRepos)
  const [manualOwner, setManualOwner] = useState('')
  const [manualName, setManualName] = useState('')

  useEffect(() => {
    // Only fetch repos if not using shared app (no API token available)
    if (authMethod !== 'shared-app') {
      fetchUserRepos()
    }
  }, [authMethod])

  const fetchUserRepos = async () => {
    setLoading(true)
    setError(null)
    setAvailableRepos([])

    try {
      const token = await getActiveToken()
      const headers = token ? { 'Authorization': `token ${token}` } : {}

      let allRepos = []
      let page = 1
      let hasMore = true

      // Fetch all repositories the user has access to (personal + orgs + collaborator)
      while (hasMore) {
        const response = await fetch(
          `https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated`,
          { headers }
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch repositories: ${response.status}`)
        }

        const data = await response.json()
        allRepos = [...allRepos, ...data]

        // Check if there are more pages
        hasMore = data.length === 100
        page++
      }

      setAvailableRepos(allRepos)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addRepository = (repo) => {
    if (!repos.find(r => r.name === repo.name)) {
      setRepos([...repos, {
        name: repo.name,
        owner: repo.owner.login,
        description: repo.description,
        category: 'custom'
      }])
    }
  }

  const removeRepository = (repoName) => {
    setRepos(repos.filter(r => r.name !== repoName))
  }

  const addManualRepository = () => {
    if (manualOwner && manualName) {
      if (!repos.find(r => r.name === manualName && r.owner === manualOwner)) {
        setRepos([...repos, {
          name: manualName,
          owner: manualOwner,
          description: '',
          category: 'custom'
        }])
        setManualOwner('')
        setManualName('')
      }
    }
  }

  const handleSave = () => {
    onSaveRepos(repos)
    onClose()
  }

  const filteredAvailable = availableRepos.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.owner.login.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2 className="f3 text-normal mb-0">Settings</h2>
          <IconButton 
            icon={XIcon}
            onClick={onClose}
            aria-label="Close settings"
            className="color-fg-muted"
          />
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3 className="f4 mb-2">Selected Repositories ({repos.length})</h3>
            <div className="repo-list">
              {repos.length === 0 ? (
                <p className="color-fg-muted text-center py-4">No repositories selected</p>
              ) : (
                repos.map(repo => (
                  <div key={repo.name} className="repo-item">
                    <div className="flex-1">
                      <div className="f5 text-bold">{repo.owner}/{repo.name}</div>
                      {repo.description && (
                        <div className="f6 color-fg-muted">{repo.description}</div>
                      )}
                    </div>
                    <IconButton
                      icon={TrashIcon}
                      onClick={() => removeRepository(repo.name)}
                      aria-label="Remove repository"
                      variant="danger"
                      size="small"
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="settings-section">
            <h3 className="f4 mb-2">
              {authMethod === 'shared-app' ? 'Add Repository' : 'Available Repositories'}
            </h3>

            {authMethod === 'shared-app' ? (
              <div>
                <p className="f6 color-fg-muted mb-3">
                  Enter the owner and repository name to add a repository to your dashboard.
                </p>
                <div className="d-flex flex-column" style={{ gap: '12px' }}>
                  <TextInput
                    placeholder="Owner (e.g., facebook)"
                    value={manualOwner}
                    onChange={(e) => setManualOwner(e.target.value)}
                  />
                  <TextInput
                    placeholder="Repository name (e.g., react)"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                  />
                  <Button
                    leadingVisual={PlusIcon}
                    onClick={addManualRepository}
                    disabled={!manualOwner || !manualName}
                  >
                    Add Repository
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <TextInput
                  leadingVisual={SearchIcon}
                  placeholder="Search repositories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ mb: 2 }}
                />

                {loading ? (
                  <p className="color-fg-muted text-center py-4">Loading repositories...</p>
                ) : error ? (
                  <p className="color-fg-danger text-center py-4">{error}</p>
                ) : (
                  <div className="repo-list">
                    {filteredAvailable.map(repo => {
                      const isSelected = repos.find(r => r.name === repo.name)
                      return (
                        <div key={repo.id} className="repo-item">
                          <div>
                            <div className="f5 text-bold">{repo.owner.login}/{repo.name}</div>
                            {repo.description && (
                              <div className="f6 color-fg-muted">{repo.description}</div>
                            )}
                          </div>
                          <Button
                            size="small"
                            leadingVisual={PlusIcon}
                            onClick={() => addRepository(repo)}
                            disabled={isSelected}
                          >
                            {isSelected ? 'Added' : 'Add'}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="settings-footer">
          <Button onClick={onClose} variant="invisible">Cancel</Button>
          <Button onClick={handleSave} variant="primary">Save Changes</Button>
        </div>
      </div>
    </div>
  )
}
