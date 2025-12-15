import { useState, useEffect } from 'react'
import { XIcon, SearchIcon, PlusIcon, TrashIcon, TagIcon } from '@primer/octicons-react'
import { Button, IconButton, TextInput, Label, Select } from '@primer/react'
import './Settings.css'

const LABEL_COLORS = [
  '#0969da', // blue
  '#1a7f37', // green
  '#cf222e', // red
  '#8250df', // purple
  '#bf8700', // yellow
  '#bc4c00', // orange
  '#0969da', // teal
  '#6639ba', // indigo
  '#d1242f', // pink
  '#6e7781', // gray
]

export function Settings({ onClose, getActiveToken, selectedRepos, onSaveRepos }) {
  const [activeTab, setActiveTab] = useState('repositories')
  const [searchQuery, setSearchQuery] = useState('')
  const [availableRepos, setAvailableRepos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [repos, setRepos] = useState(selectedRepos)
  
  // Labels state
  const [customLabels, setCustomLabels] = useState(() => {
    const saved = localStorage.getItem('customLabels')
    return saved ? JSON.parse(saved) : []
  })
  const [newLabelName, setNewLabelName] = useState('')

  useEffect(() => {
    fetchUserRepos()
  }, [])

  const fetchUserRepos = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = await getActiveToken()
      const headers = token ? { 'Authorization': `token ${token}` } : {}
      
      // Fetch user's accessible repositories
      const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', { headers })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch repositories: ${response.status}`)
      }
      
      const data = await response.json()
      setAvailableRepos(data)
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
        category: 'custom',
        labels: []
      }])
    }
  }

  const removeRepository = (repoName) => {
    setRepos(repos.filter(r => r.name !== repoName))
  }

  const addLabelToRepo = (repoName, label) => {
    setRepos(repos.map(r => {
      if (r.name === repoName) {
        const labels = r.labels || []
        if (!labels.includes(label)) {
          return { ...r, labels: [...labels, label] }
        }
      }
      return r
    }))
  }

  const removeLabelFromRepo = (repoName, label) => {
    setRepos(repos.map(r => {
      if (r.name === repoName) {
        return { ...r, labels: (r.labels || []).filter(l => l !== label) }
      }
      return r
    }))
  }

  const addCustomLabel = () => {
    if (newLabelName.trim() && !customLabels.find(l => l.name === newLabelName.trim())) {
      // Automatically assign a color from the palette
      const colorIndex = customLabels.length % LABEL_COLORS.length
      const newLabel = { name: newLabelName.trim(), color: LABEL_COLORS[colorIndex] }
      const updated = [...customLabels, newLabel]
      setCustomLabels(updated)
      localStorage.setItem('customLabels', JSON.stringify(updated))
      setNewLabelName('')
    }
  }

  const removeCustomLabel = (labelName) => {
    const updated = customLabels.filter(l => l.name !== labelName)
    setCustomLabels(updated)
    localStorage.setItem('customLabels', JSON.stringify(updated))
    // Also remove this label from all repos
    setRepos(repos.map(r => ({
      ...r,
      labels: (r.labels || []).filter(l => l !== labelName)
    })))
  }

  const handleSave = () => {
    onSaveRepos(repos)
    onClose()
  }

  const filteredAvailable = availableRepos.filter(repo => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
            variant="invisible"
          />
        </div>

        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === 'repositories' ? 'active' : ''}`}
            onClick={() => setActiveTab('repositories')}
          >
            Repositories
          </button>
          <button
            className={`settings-tab ${activeTab === 'labels' ? 'active' : ''}`}
            onClick={() => setActiveTab('labels')}
          >
            <TagIcon size={16} /> Labels
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'repositories' ? (
            <>
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
                            <div className="f6 color-fg-muted mb-1">{repo.description}</div>
                          )}
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {(repo.labels || []).map(labelName => {
                              const labelDef = customLabels.find(l => l.name === labelName)
                              return (
                                <Label
                                  key={labelName}
                                  sx={{ 
                                    backgroundColor: labelDef?.color || '#666',
                                    color: 'white',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 1
                                  }}
                                >
                                  {labelName}
                                  <button
                                    onClick={() => removeLabelFromRepo(repo.name, labelName)}
                                    style={{ 
                                      background: 'none',
                                      border: 'none',
                                      color: 'white',
                                      cursor: 'pointer',
                                      padding: 0,
                                      marginLeft: '4px'
                                    }}
                                  >
                                    ×
                                  </button>
                                </Label>
                              )
                            })}
                            {customLabels.length > 0 && (
                              <Select
                                size="small"
                                onChange={(e) => {
                                  if (e.target.value) {
                                    addLabelToRepo(repo.name, e.target.value)
                                    e.target.value = ''
                                  }
                                }}
                                sx={{ maxWidth: '150px' }}
                              >
                                <Select.Option value="">+ Add label</Select.Option>
                                {customLabels
                                  .filter(l => !(repo.labels || []).includes(l.name))
                                  .map(l => (
                                    <Select.Option key={l.name} value={l.name}>
                                      {l.name}
                                    </Select.Option>
                                  ))}
                              </Select>
                            )}
                          </div>
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
                <h3 className="f4 mb-2">Available Repositories</h3>
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
              </div>
            </>
          ) : (
            <div className="settings-section" style={{ gridColumn: '1 / -1' }}>
              <h3 className="f4 mb-2">Custom Labels</h3>
              <p className="f6 color-fg-muted mb-3">
                Create custom labels to organize your repositories
              </p>
              
              <div className="d-flex gap-2 mb-3">
                <TextInput
                  placeholder="Label name (e.g., Production, Staging, Backend)"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomLabel()}
                  sx={{ flex: 1 }}
                />
                <Button
                  onClick={addCustomLabel}
                  leadingVisual={PlusIcon}
                  disabled={!newLabelName.trim()}
                >
                  Add Label
                </Button>
              </div>

              <div className="label-list">
                {customLabels.length === 0 ? (
                  <p className="color-fg-muted text-center py-4">No custom labels yet</p>
                ) : (
                  customLabels.map(label => (
                    <div key={label.name} className="label-item">
                      <Label
                        sx={{
                          backgroundColor: label.color,
                          color: 'white',
                          fontSize: 1
                        }}
                      >
                        {label.name}
                      </Label>
                      <IconButton
                        icon={TrashIcon}
                        onClick={() => removeCustomLabel(label.name)}
                        aria-label="Remove label"
                        variant="danger"
                        size="small"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="settings-footer">
          <Button onClick={onClose} variant="invisible">Cancel</Button>
          <Button onClick={handleSave} variant="primary">Save Changes</Button>
        </div>
      </div>
    </div>
  )
}
