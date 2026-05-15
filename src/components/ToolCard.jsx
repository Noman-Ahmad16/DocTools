import { Link } from 'react-router-dom';

const ToolCard = ({ title, description, icon, to }) => {
  return (
    <Link to={to} className="glass-card tool-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <div style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '50%', display: 'inline-flex' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>{description}</p>
    </Link>
  );
};

export default ToolCard;
