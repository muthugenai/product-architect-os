import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArticle } from '../data/mockArticles';
import './ArticlePage.css';

export const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticle(slug) : null;

  if (!article) {
    return (
      <div className="article-page">
        <div className="article-not-found">
          <h1>Article not found</h1>
          <Link to="/" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="article-page">
      {/* Breadcrumb */}
      <nav className="article-breadcrumb" aria-label="Breadcrumb">
        {article.breadcrumb.map((crumb, i) => (
          <React.Fragment key={crumb}>
            {i === 0 ? (
              <Link to="/" className="article-breadcrumb__link">{crumb}</Link>
            ) : (
              <span className={i === article.breadcrumb.length - 1 ? 'article-breadcrumb__current' : 'article-breadcrumb__link'}>
                {crumb}
              </span>
            )}
            {i < article.breadcrumb.length - 1 && (
              <span className="article-breadcrumb__sep">›</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Header */}
      <div className="article-header">
        <span className="lozenge lozenge-info article-category">{article.category}</span>
        <h1 className="article-title">{article.title}</h1>
        <div className="article-meta">
          <span>Last updated: Feb 12, 2026</span>
          <span className="article-meta__sep">·</span>
          <span>5 min read</span>
        </div>
      </div>

      {/* Content */}
      <div className="article-body">
        {article.content.split('\n').map((line, i) => {
          if (line.startsWith('## ')) return <h2 key={i} className="article-h2">{line.replace('## ', '')}</h2>;
          if (line.startsWith('### ')) return <h3 key={i} className="article-h3">{line.replace('### ', '')}</h3>;
          if (line.startsWith('| ')) {
            // Table row (simplified rendering)
            if (line.startsWith('|---')) return null;
            const cells = line.split('|').filter(c => c.trim());
            const isHeader = i > 0 && article.content.split('\n')[i + 1]?.startsWith('|---');
            return isHeader ? (
              <tr key={i}>{cells.map((c, j) => <th key={j}>{c.trim()}</th>)}</tr>
            ) : (
              <tr key={i}>{cells.map((c, j) => <td key={j}>{c.trim()}</td>)}</tr>
            );
          }
          if (line.startsWith('- **')) {
            const match = line.match(/^- \*\*(.+?)\*\* — (.+)$/);
            if (match) return <li key={i}><strong>{match[1]}</strong> — {match[2]}</li>;
          }
          if (line.startsWith('- ')) return <li key={i}>{line.replace('- ', '')}</li>;
          if (line.trim()) return <p key={i} className="article-p">{line}</p>;
          return null;
        })}
      </div>

      {/* Related */}
      {article.relatedArticles.length > 0 && (
        <div className="article-related">
          <h3 className="article-related__title">Related Articles</h3>
          <ul className="article-related__list">
            {article.relatedArticles.map(a => (
              <li key={a.slug}>
                <Link to={`/article/${a.slug}`} className="article-related__link">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2 1h9l3 3v11H2V1zm8 0v3h3"/>
                  </svg>
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
