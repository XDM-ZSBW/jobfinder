/**
 * Agent UI Renderer
 * 
 * Renders UI schemas from agents into React components.
 * Provides clear separation between agent logic and presentation.
 */

// React imports removed - not needed for this component
import { AgentUISchema, Component } from '@/schemas/ui-schema';

interface AgentUIRendererProps {
  schema: AgentUISchema;
  onAction?: (actionId: string, payload?: any) => void;
}

export function AgentUIRenderer({ schema, onAction }: AgentUIRendererProps) {
  return (
    <div className="agent-ui" data-agent-id={schema.agentId}>
      <div className="agent-header">
        <h2>{schema.agentName}</h2>
      </div>
      
      <div className={`agent-layout agent-layout-${schema.layout.type}`}>
        {schema.components.map(component => (
          <ComponentRenderer
            key={component.id}
            component={component}
            state={schema.state}
            onAction={onAction}
          />
        ))}
      </div>
      
      {schema.actions.length > 0 && (
        <div className="agent-actions">
          {schema.actions.map(action => (
            <ActionButton
              key={action.id}
              action={action}
              onClick={() => onAction?.(action.id, action.payload)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ComponentRenderer({
  component,
  state,
  onAction,
}: {
  component: Component;
  state: Record<string, any>;
  onAction?: (actionId: string, payload?: any) => void;
}) {
  // Resolve bound state value
  const value = component.bind
    ? getNestedValue(state, component.bind)
    : undefined;

  switch (component.type) {
    case 'container':
      return (
        <div className="component-container" style={component.style}>
          {component.children?.map(child => (
            <ComponentRenderer
              key={child.id}
              component={child}
              state={state}
              onAction={onAction}
            />
          ))}
        </div>
      );

    case 'text':
      return (
        <p className="component-text" style={component.style}>
          {component.props?.content || value || ''}
        </p>
      );

    case 'progress':
      return (
        <ProgressComponent
          component={component}
          value={value || component.props?.value || 0}
        />
      );

    case 'card':
      return (
        <div className="component-card" style={component.style}>
          {component.children?.map(child => (
            <ComponentRenderer
              key={child.id}
              component={child}
              state={state}
              onAction={onAction}
            />
          ))}
        </div>
      );

    case 'alert':
      return (
        <AlertComponent
          component={component}
          message={value || component.props?.message}
        />
      );

    case 'badge':
      return (
        <BadgeComponent
          component={component}
          label={value || component.props?.label}
        />
      );

    case 'spinner':
      return <SpinnerComponent component={component} />;

    case 'table':
      return (
        <TableComponent
          component={component}
          data={value || component.props?.data || []}
        />
      );

    case 'chart':
      return (
        <ChartComponent
          component={component}
          data={value || component.props?.data || []}
        />
      );

    default:
      return (
        <div className="component-unknown">
          Unknown component type: {component.type}
        </div>
      );
  }
}

// Individual Component Implementations
function ProgressComponent({
  component,
  value,
}: {
  component: Component;
  value: number;
}) {
  const max = component.props?.max || 100;
  const percentage = Math.min((value / max) * 100, 100);
  const color = component.props?.color || 'primary';

  return (
    <div className="component-progress">
      {component.props?.label && (
        <label className="progress-label">{component.props.label}</label>
      )}
      <div className={`progress-bar progress-${color}`}>
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {component.props?.showPercentage && (
        <span className="progress-percentage">{percentage.toFixed(0)}%</span>
      )}
    </div>
  );
}

function AlertComponent({
  component,
  message,
}: {
  component: Component;
  message?: string;
}) {
  const severity = component.props?.severity || 'info';

  return (
    <div className={`alert alert-${severity}`}>
      {message}
    </div>
  );
}

function BadgeComponent({
  component,
  label,
}: {
  component: Component;
  label?: string;
}) {
  const color = component.props?.color || 'default';

  return (
    <span className={`badge badge-${color}`}>
      {label}
    </span>
  );
}

function SpinnerComponent({ component: _component }: { component: Component }) {
  return (
    <div className="spinner">
      <div className="spinner-circle" />
    </div>
  );
}

function TableComponent({
  component,
  data,
}: {
  component: Component;
  data: any[];
}) {
  const columns = component.props?.columns || [];

  return (
    <table className="component-table">
      <thead>
        <tr>
          {columns.map((col: any) => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx}>
            {columns.map((col: any) => (
              <td key={col.key}>
                {col.render ? col.render(row[col.key]) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ChartComponent({
  component,
  data: _data,
}: {
  component: Component;
  data: any[];
}) {
  // Integrate with charting library (e.g., recharts, chart.js)
  return (
    <div className="component-chart">
      Chart: {component.props?.chartType} (implement with charting library)
    </div>
  );
}

function ActionButton({
  action,
  onClick,
}: {
  action: any;
  onClick: () => void;
}) {
  const handleClick = () => {
    if (action.confirm) {
      if (window.confirm(action.confirmMessage || 'Are you sure?')) {
        onClick();
      }
    } else {
      onClick();
    }
  };

  return (
    <button
      className={`action-button action-${action.type}`}
      onClick={handleClick}
    >
      {action.label}
    </button>
  );
}

// Helper function to get nested values from state
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

