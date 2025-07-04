import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { cn } from '@/utils/cn';

interface StudyBuddyDisplayProps {
  content: string;
}

const StudyBuddyDisplay: React.FC<StudyBuddyDisplayProps> = ({ content }) => {
  // Clean content by removing function calls
  const cleanContent = content
    .split('\n')
    .filter(line => !line.trim().includes('<function='))
    .join('\n');

  // Check if content has structured educational content
  const hasStructuredContent = (
    cleanContent.includes('##') ||
    cleanContent.includes('**') ||
    cleanContent.includes('1.') ||
    cleanContent.includes('2.') ||
    cleanContent.includes('•') ||
    cleanContent.includes('*') ||
    cleanContent.includes('📚') ||
    cleanContent.includes('🚀') ||
    cleanContent.includes('🎯') ||
    cleanContent.includes('✨') ||
    cleanContent.includes('```')
  );

  if (!hasStructuredContent) {
    return (
      <div className="prose prose-sm max-w-none text-gray-900 dark:text-white">
        <p className="leading-relaxed whitespace-pre-wrap">{cleanContent}</p>
      </div>
    );
  }

  // Custom components for react-markdown
  const components = {
    // Headers with educational icons
    h1: ({ children }: any) => (
      <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-6 mb-4 flex items-center">
        📚 {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-5 mb-3 flex items-center">
        📚 {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-4 mb-2 flex items-center">
        📚 {children}
      </h3>
    ),
    
    // Enhanced list items
    li: ({ children }: any) => (
      <li className="mb-2 flex items-start space-x-2">
        <span className="text-blue-500 dark:text-blue-400 mt-1">•</span>
        <div className="flex-1 text-gray-900 dark:text-white leading-relaxed">{children}</div>
      </li>
    ),
    
    // Ordered list items with styled numbers
    ol: ({ children }: any) => (
      <ol className="space-y-3 mb-4">{children}</ol>
    ),
    
    // Unordered lists
    ul: ({ children }: any) => (
      <ul className="space-y-2 mb-4 pl-4">{children}</ul>
    ),
    
    // Paragraphs
    p: ({ children }: any) => (
      <p className="text-gray-900 dark:text-white leading-relaxed mb-3">{children}</p>
    ),
    
    // Strong/bold text
    strong: ({ children }: any) => (
      <strong className="font-semibold text-blue-600 dark:text-blue-400">{children}</strong>
    ),
    
    // Links
    a: ({ href, children }: any) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline"
      >
        {children}
      </a>
    ),
    
    // Inline code
    code: ({ inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      
      if (!inline && match) {
        // Block code with syntax highlighting
        return (
          <div className="my-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              {match[1]}
            </div>
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              className="!bg-gray-50 dark:!bg-gray-900 !m-0"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          </div>
        );
      }
      
      // Inline code
      return (
        <code className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    },
    
    // Block quotes
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300 italic mb-3">
        {children}
      </blockquote>
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-blue-50 dark:bg-blue-900/30">{children}</thead>
    ),
    tbody: ({ children }: any) => (
      <tbody className="divide-y divide-gray-200 dark:divide-gray-600">{children}</tbody>
    ),
    tr: ({ children }: any) => (
      <tr className="hover:bg-blue-50 dark:hover:bg-blue-900/20">{children}</tr>
    ),
    th: ({ children }: any) => (
      <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wider border-b border-blue-200 dark:border-blue-600">
        📊 {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700">
        {children}
      </td>
    ),
  };

  return (
    <div className="space-y-2">
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown 
          components={components}
          remarkPlugins={[remarkGfm]}
        >
          {cleanContent}
        </ReactMarkdown>
      </div>
      
      {/* Learning progress indicator */}
      {cleanContent.includes('Next Steps') && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600 dark:text-blue-400">🎯</span>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Ready for your next learning step!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyBuddyDisplay;