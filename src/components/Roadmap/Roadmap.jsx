import { ChevronLeftIcon, MoonIcon, SunIcon, RocketIcon } from '@primer/octicons-react'
import { Button, IconButton, Text, Label } from '@primer/react'
import { roadmapItems, statusConfig } from './roadmapData'
import './Roadmap.css'

export function Roadmap({ onBack, theme, setTheme }) {
  return (
    <div className="roadmap-page">
      {/* Header */}
      <header className="roadmap-header">
        <div className="container">
          <div className="d-flex flex-justify-between flex-items-center">
            <div className="d-flex flex-items-center" style={{ gap: '12px' }}>
              <RocketIcon size={28} />
              <Text sx={{ fontSize: 3, fontWeight: 'semibold' }}>Actions Dashboard</Text>
            </div>
            <div className="d-flex flex-items-center" style={{ gap: '16px' }}>
              <Button
                variant="invisible"
                onClick={onBack}
                leadingVisual={ChevronLeftIcon}
              >
                Back
              </Button>
              <IconButton
                icon={theme === 'dark' ? SunIcon : MoonIcon}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
                className="color-fg-muted"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="roadmap-container">
        <div className="roadmap-intro">
          <h1 className="roadmap-title">Roadmap</h1>
          <p>Our plan for Actions Dashboard. Features are subject to change based on feedback and priorities.</p>
        </div>

        <div className="roadmap-list">
          {roadmapItems.map(item => {
            const status = statusConfig[item.status]
            
            return (
              <div key={item.id} className="roadmap-card">
                <div className="card-header">
                  <h3 className="card-title">{item.title}</h3>
                  <Label variant={status.variant} size="small">
                    {status.label}
                  </Label>
                </div>
                <p className="card-description">{item.description}</p>
                {item.benefits && (
                  <ul className="card-benefits">
                    {item.benefits.map((benefit, idx) => (
                      <li key={idx}>{benefit}</li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
