import { useState, useEffect } from 'react'

/**
 * Hook to manage teams and team membership
 * Stores teams in localStorage for now (could be backend later)
 */
export function useTeams(userId) {
  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem('teams')
    return saved ? JSON.parse(saved) : []
  })

  const [currentTeamId, setCurrentTeamId] = useState(() => {
    return localStorage.getItem('currentTeamId') || null
  })

  useEffect(() => {
    localStorage.setItem('teams', JSON.stringify(teams))
  }, [teams])

  useEffect(() => {
    if (currentTeamId) {
      localStorage.setItem('currentTeamId', currentTeamId)
    }
  }, [currentTeamId])

  const createTeam = (name, description) => {
    const newTeam = {
      id: `team-${Date.now()}`,
      name,
      description,
      createdAt: new Date().toISOString(),
      createdBy: userId,
      members: [
        {
          userId,
          role: 'admin',
          joinedAt: new Date().toISOString()
        }
      ],
      tabs: [
        {
          id: 'default',
          name: 'All Repositories',
          repositories: [],
          color: 'blue'
        }
      ]
    }
    setTeams([...teams, newTeam])
    setCurrentTeamId(newTeam.id)
    return newTeam
  }

  const deleteTeam = (teamId) => {
    setTeams(teams.filter(t => t.id !== teamId))
    if (currentTeamId === teamId) {
      setCurrentTeamId(teams[0]?.id || null)
    }
  }

  const inviteMember = (teamId, email, role = 'member') => {
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        const invitation = {
          id: `invite-${Date.now()}`,
          email,
          role,
          invitedAt: new Date().toISOString(),
          status: 'pending'
        }
        return {
          ...team,
          invitations: [...(team.invitations || []), invitation]
        }
      }
      return team
    }))
  }

  const removeMember = (teamId, userId) => {
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          members: team.members.filter(m => m.userId !== userId)
        }
      }
      return team
    }))
  }

  const updateMemberRole = (teamId, userId, newRole) => {
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          members: team.members.map(m => 
            m.userId === userId ? { ...m, role: newRole } : m
          )
        }
      }
      return team
    }))
  }

  const currentTeam = teams.find(t => t.id === currentTeamId)
  const userRole = currentTeam?.members.find(m => m.userId === userId)?.role

  return {
    teams,
    currentTeam,
    currentTeamId,
    setCurrentTeamId,
    createTeam,
    deleteTeam,
    inviteMember,
    removeMember,
    updateMemberRole,
    isAdmin: userRole === 'admin'
  }
}
