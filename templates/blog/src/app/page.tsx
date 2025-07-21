import React from 'react';

export default function BlogHomePage() {
  const posts = [
    {
      id: 1,
      title: 'Welcome to {{PROJECT_NAME_PASCAL}} Blog',
      excerpt: 'This is your first blog post. Start writing amazing content!',
      date: '2024-01-01',
      slug: 'welcome-to-blog'
    },
    {
      id: 2,
      title: 'Getting Started with Stratus',
      excerpt: 'Learn how to build amazing applications with the Stratus framework.',
      date: '2024-01-02',
      slug: 'getting-started'
    }
  ];

  return (
    <div className="blog-home">
      <header className="blog-header">
        <h1>{{PROJECT_NAME_PASCAL}} Blog</h1>
        <p>Welcome to our blog where we share insights and updates</p>
      </header>

      <main className="blog-posts">
        {posts.map(post => (
          <article key={post.id} className="post-preview">
            <h2>{post.title}</h2>
            <p className="post-meta">Published on {post.date}</p>
            <p className="post-excerpt">{post.excerpt}</p>
            <a href={`/posts/${post.slug}`} className="read-more">
              Read more →
            </a>
          </article>
        ))}
      </main>
    </div>
  );
}