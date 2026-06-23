import { useState, useEffect } from 'react'
import { XIcon, SearchIcon, PlusIcon, TrashIcon, PeopleIcon } from '@primer/octicons-react'
import { Button, IconButton, TextInput } from '@primer/react'
import { trackEvent } from '../../utils/analytics'
import { MOCK_REPO_STATUSES } from '../../data/mockRepoStatuses'
import { useGroups } from '../../hooks/useGroups'
import './Settings.css'

export function Settings({ onClose, getActiveToken, authMethod, selectedRepos, onSaveRepos, isDemoMode }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [availableRepos, setAvailableRepos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [repos, setRepos] = useState(selectedRepos)
  const [manualOwner, setManualOwner] = useState('')
  const [manualName, setManualName] = useState('')
  const [activeTab, setActiveTab] = useState('repos')

  // Groups are only available to OAuth session users
  const isOAuthSession = authMethod === 'oauth'
  const { groups, loading: groupsLoading, error: groupsError, fetchGroups, createGroup, inviteMember, removeMember } = useGroups(isOAuthSession)

  const [newGroupName, setNewGroupName] = useState('')
  const [inviteLogin, setInviteLogin] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [groupActionError, setGroupActionError] = useState(null)

  useEffect(() => {
    if (isDemoMode) {
      const demoRepos = Object.keys(MOCK_REPO_STATUSES).map(repoName => ({
        id: repoName,
        name: repoName,
        owner: { login: 'demo' },
        description: MOCK_REPO_STATUSES[repoName].description || '',
        topics: MOCK_REPO_STATUSES[repoName].topics || []
      }))
      setAvailableRepos(demoRepos)
    } else {
      fetchUserRepos()
    }
  }, [authMethod, isDemoMode])

  useEffect(() => {
    if (isOAuthSession && activeTab === 'groups') {
      fetchGroups()
    }
  }, [activeTab, isOAuthSession]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserRepos = async () => {
    if (isDemoMode) return
    setLoading(true)
    setError(null)
    setAvailableRepos([])

    try {
      const token = await getActiveToken()
      const headers = token ? { 'Authorization': `token ${token}` } : {}

      let allRepos = []
      let page = 1
      let hasMore = true

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
      trackEvent('Repository Added', { source: 'search' })
    }
  }

  const removeRepository = (repoName) => {
    const repo = repos.find(r => r.name === repoName)
    setRepos(repos.filter(r => r.name !== repoName))
    if (repo) trackEvent('Repository Removed')
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
        trackEvent('Repository Added', { source: 'manual' })
        setManualOwner('')
        setManualName('')
      }
    }
  }

  const handleSave = () => {
    trackEvent('Settings Saved', { repoCount: repos.length })
    onSaveRepos(repos)
    onClose()
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return
    setGroupActionError(null)
    const group = await createGroup(newGroupName.trim())
    if (group) {
      setNewGroupName('')
    } else {
      setGroupActionError('Failed to create group')
    }
  }

  const handleInviteMember = async () => {
    if (!inviteLogin.trim() || !selectedGroupId) return
    setGroupActionError(null)
    await inviteMember(selectedGroupId, inviteLogin.trim())
    setInviteLogin('')
  }

  const filteredAvailable = availableRepos
    .filter(repo => !repos.find(r => r.name === repo.name && r.owner === repo.owner.login))
    .filter(repo =>
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

        {/* Tab bar */}
        <div className="d-flex border-bottom px-3" style={{ gap: '0' }}>
          <button
            className={`btn-link f6 py-2 px-3 border-0 bg-transparent ${activeTab === 'repos' ? 'color-fg-default border-bottom border-accent' : 'color-fg-muted'}`}
            style={{ fontWeight: activeTab === 'repos' ? 600 : 400, cursor: 'pointer' }}
            onClick={() => setActiveTab('repos')}
          >
            Repositories
          </button>
          {isOAuthSession && (
            <button
              className={`btn-link f6 py-2 px-3 border-0 bg-transparent ${activeTab === 'groups' ? 'color-fg-default border-bottom border-accent' : 'color-fg-muted'}`}
              style={{ fontWeight: activeTab === 'groups' ? 600 : 400, cursor: 'pointer' }}
              onClick={() => setActiveTab('groups')}
            >
              My Groups
            </button>
          )}
        </div>

        <div className="settings-content">
          {activeTab === 'repos' && (
            <>
              <div className="settings-section">
                <h3 className="f4 mb-2">Selected Repositories ({repos.length})</h3>
                <div className="repo-list">
                  {repos.length === 0 ? (
                    <p className="color-fg-muted text-center py-4">No repositories selected</p>
                  ) : (
                    repos
                      .filter(repo => !isDemoMode || repo.owner === 'demo')
                      .map(repo => (
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
                    {filteredAvailable.map(repo => (
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
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'groups' && isOAuthSession && (
            <div className="settings-section">
              <h3 className="f4 mb-3">My Groups</h3>
              {groupsError && <p className="color-fg-danger mb-2">{groupsError}</p>}
              {groupActionError && <p className="color-fg-danger mb-2">{groupActionError}</p>}

              {/* Create group */}
              <div className="d-flex mb-3" style={{ gap: '8px' }}>
                <TextInput
                  placeholder="New group name..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
                  sx={{ flex: 1 }}
                />
                <Button
                  leadingVisual={PlusIcon}
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim()}
                >
                  Create
                </Button>
              </div>

              {/* Group list */}
              {groupsLoading ? (
                <p className="color-fg-muted text-center py-4">Loading groups...</p>
              ) : groups.length === 0 ? (
                <p className="color-fg-muted text-center py-4">No groups yet. Create one above to share configs with teammates.</p>
              ) : (
                <div className="repo-list">
                  {groups.map(group => (
                    <div key={group.id} className="repo-item">
                      <div className="flex-1">
                        <div className="f5 text-bold d-flex flex-items-center" style={{ gap: '6px' }}>
                          <PeopleIcon size={14} />
                          {group.name}
                        </div>
                        <div className="f6 color-fg-muted">Role: {group.role}</div>
                      </div>
                      <div className="d-flex" style={{ gap: '6px' }}>
                        <Button
                          size="small"
                          onClick={() => setSelectedGroupId(selectedGroupId === group.id ? null : group.id)}
                        >
                          {selectedGroupId === group.id ? 'Hide' : 'Manage'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Invite member panel */}
              {selectedGroupId && (
                <div className="mt-3 p-3 border rounded-2">
                  <h4 className="f5 mb-2">Invite to group</h4>
                  <div className="d-flex" style={{ gap: '8px' }}>
                    <TextInput
                      placeholder="GitHub login..."
                      value={inviteLogin}
                      onChange={(e) => setInviteLogin(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleInviteMember()}
                      sx={{ flex: 1 }}
                    />
                    <Button
                      onClick={handleInviteMember}
                      disabled={!inviteLogin.trim()}
                    >
                      Invite
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="settings-footer">
          <Button onClick={onClose} variant="invisible">Cancel</Button>
          {activeTab === 'repos' && (
            <Button onClick={handleSave} variant="primary">Save Changes</Button>
          )}
        </div>
      </div>
    </div>
  )
}
