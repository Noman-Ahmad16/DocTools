import React, { useState } from 'react';
import ToolCard from '../components/ToolCard';
import { toolCategories, getAllTools } from '../config/toolsConfig';
import { Search } from 'lucide-react';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const allTools = getAllTools();
  const filteredTools = allTools.filter(tool => 
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', fontWeight: 700 }} className="text-gradient">
          Every Tool You Need in One Place
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Scan, Merge, Convert, and Edit your documents securely in your browser.
        </p>

        {/* Search Bar on Home Page */}
        <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
          <Search size={24} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search all 46+ tools..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', padding: '1.2rem 1.2rem 1.2rem 3.5rem', 
              borderRadius: '1rem', background: 'rgba(255,255,255,0.05)', 
              border: '1px solid var(--surface-border)', color: 'white',
              fontSize: '1.1rem', outline: 'none'
            }} 
          />
        </div>
      </div>

      {searchQuery ? (
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ marginBottom: '2rem' }}>Search Results</h2>
          {filteredTools.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {filteredTools.map(tool => (
                <ToolCard 
                  key={tool.id}
                  title={tool.title} 
                  description={tool.description}
                  icon={tool.icon}
                  to={tool.to}
                />
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>No tools found for "{searchQuery}"</p>
          )}
        </div>
      ) : (
        toolCategories.map(category => (
          <div key={category.id} id={category.id} style={{ marginBottom: '4rem' }}>
            <h2 style={{ marginBottom: '2rem', fontSize: '2rem' }} className="text-gradient">{category.name} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginLeft: '1rem' }}>({category.tools.length} tools)</span></h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {category.tools.map(tool => (
                <ToolCard 
                  key={tool.id}
                  title={tool.title} 
                  description={tool.description}
                  icon={tool.icon}
                  to={tool.to}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Home;
