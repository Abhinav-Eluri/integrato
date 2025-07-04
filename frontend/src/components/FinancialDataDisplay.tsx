import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, BuildingOfficeIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

interface FinancialDataDisplayProps {
  content: string;
}

interface StockData {
  symbol?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  marketCap?: string;
  volume?: string;
  pe?: number;
  eps?: number;
  dividend?: number;
  high52?: number;
  low52?: number;
  companyName?: string;
  sector?: string;
  industry?: string;
  employees?: string;
  description?: string;
  recommendations?: Array<{
    firm: string;
    rating: string;
    target?: number;
  }>;
}

const FinancialDataDisplay: React.FC<FinancialDataDisplayProps> = ({ content }) => {
  // Check if content contains financial data patterns
  const hasFinancialData = (
    content.includes('$') && 
    (content.includes('stock price') || content.includes('Stock Price') || content.includes('Current Price') || 
     content.includes('price of') || content.includes('AAPL') || content.includes('MSFT') || 
     content.includes('GOOGL') || content.includes('TSLA') || /\b[A-Z]{2,5}\b/.test(content) ||
     /\*\*\$[0-9,]+\.?[0-9]*\*\*/.test(content))
  ) || content.includes('Market Cap') || content.includes('P/E Ratio') || content.includes('analyst') || 
      content.includes('recommendations');

  if (!hasFinancialData) {
    // Clean content by removing function calls
    const cleanContent = content
      .split('\n')
      .filter(line => !line.includes('<function='))
      .join('\n');

    const components = {
      h1: ({ children }: any) => (
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
          💰 {children}
        </h1>
      ),
      h2: ({ children }: any) => (
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
          📊 {children}
        </h2>
      ),
      h3: ({ children }: any) => (
        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2 flex items-center">
          📈 {children}
        </h3>
      ),
      p: ({ children }: any) => (
        <p className="text-sm leading-relaxed text-gray-900 dark:text-white mb-2">{children}</p>
      ),
      ul: ({ children }: any) => (
        <ul className="list-none space-y-1 mb-3">{children}</ul>
      ),
      ol: ({ children }: any) => (
        <ol className="list-decimal list-inside space-y-1 mb-3 text-gray-900 dark:text-white">{children}</ol>
      ),
      li: ({ children }: any) => (
        <li className="text-sm text-gray-900 dark:text-white flex items-start">
          <span className="text-blue-500 mr-2">•</span>
          <span>{children}</span>
        </li>
      ),
      strong: ({ children }: any) => (
        <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>
      ),
      a: ({ href, children }: any) => (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
        >
          {children}
        </a>
      ),
      code: ({ inline, className, children, ...props }: any) => {
        const match = /language-(\w+)/.exec(className || '');
        const language = match ? match[1] : '';
        
        if (inline) {
          return (
            <code className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-1 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          );
        }
        
        return (
          <div className="my-3">
            {language && (
              <div className="bg-gray-800 text-gray-300 px-3 py-1 text-xs font-medium rounded-t-md border-b border-gray-600">
                {language.toUpperCase()}
              </div>
            )}
            <SyntaxHighlighter
              style={oneDark}
              language={language || 'text'}
              PreTag="div"
              className="!mt-0 !rounded-t-none"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          </div>
        );
      },
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
          <thead className="bg-gray-50 dark:bg-gray-700">{children}</thead>
        ),
        tbody: ({ children }: any) => (
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">{children}</tbody>
        ),
        tr: ({ children }: any) => (
          <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">{children}</tr>
        ),
        th: ({ children }: any) => (
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
            {children}
          </th>
        ),
        td: ({ children }: any) => (
          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700">
            {children}
          </td>
        ),
    };

    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
          {cleanContent}
        </ReactMarkdown>
      </div>
    );
  }

  // Parse financial data from content
  const parseFinancialData = (text: string): StockData => {
    const data: StockData = {};
    
    // Extract stock symbol
    const symbolMatch = text.match(/\b([A-Z]{2,5})\b.*?(?:stock|price)|(?:stock|price).*?\b([A-Z]{2,5})\b|\(([A-Z]{2,5})\)/i);
    if (symbolMatch) {
      data.symbol = symbolMatch[1] || symbolMatch[2] || symbolMatch[3];
    }
    
    // Extract price - improved patterns
    const priceMatch = text.match(/(?:price.*?|is.*?)\*\*\$([0-9,]+\.?[0-9]*)\*\*|\$([0-9,]+\.?[0-9]*)|\*\*\$([0-9,]+\.?[0-9]*)\*\*/i);
    if (priceMatch) {
      const priceStr = priceMatch[1] || priceMatch[2] || priceMatch[3];
      data.price = parseFloat(priceStr.replace(/,/g, ''));
    }
    
    // Extract market cap
    const marketCapMatch = text.match(/Market Cap[^\n]*\$([0-9.,]+\s*[BMT]?)/i);
    if (marketCapMatch) {
      data.marketCap = marketCapMatch[1];
    }
    
    // Extract P/E ratio
    const peMatch = text.match(/P\/E Ratio[^\n]*?([0-9.]+)/i);
    if (peMatch) {
      data.pe = parseFloat(peMatch[1]);
    }
    
    // Extract EPS
    const epsMatch = text.match(/EPS[^\n]*?\$?([0-9.]+)/i);
    if (epsMatch) {
      data.eps = parseFloat(epsMatch[1]);
    }
    
    // Extract company name - improved patterns
    const companyMatch = text.match(/Company:\s*([^\n]+)/i) || 
                        text.match(/(?:stock price of|price of)\s+([^\(\n]+?)(?:\s*\([A-Z]+\))?/i) ||
                        text.match(/([^\n]+?)\s*\(([A-Z]{2,5})\)/i) ||
                        text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*\([A-Z]{2,5}\)/i);
    if (companyMatch) {
      data.companyName = companyMatch[1].trim();
      // Also extract symbol if found in the same match
      if (companyMatch[2] && !data.symbol) {
        data.symbol = companyMatch[2];
      }
    }
    
    // Extract sector
    const sectorMatch = text.match(/Sector:\s*([^\n]+)/i);
    if (sectorMatch) {
      data.sector = sectorMatch[1].trim();
    }
    
    // Extract industry
    const industryMatch = text.match(/Industry:\s*([^\n]+)/i);
    if (industryMatch) {
      data.industry = industryMatch[1].trim();
    }
    
    // Extract analyst recommendations
    const recommendationsSection = text.match(/analyst recommendations?[\s\S]*?(?=\n\n|$)/i);
    if (recommendationsSection) {
      const recText = recommendationsSection[0];
      const firms = recText.match(/[-•]\s*([^:]+):\s*([^\n]+)/g);
      if (firms) {
        data.recommendations = firms.map(firm => {
          const match = firm.match(/[-•]\s*([^:]+):\s*([^\n]+)/);
          if (match) {
            const [, firmName, rating] = match;
            return { firm: firmName?.trim() || '', rating: rating?.trim() || '' };
          }
          return { firm: '', rating: '' };
        }).filter(rec => rec.firm && rec.rating);
      }
    }
    
    return data;
  };

  const stockData = parseFinancialData(content);
  
  // If we couldn't parse meaningful financial data, fall back to regular display
  if (!stockData.price && !stockData.marketCap && !stockData.symbol) {
    // Clean content by removing function calls
    const cleanContent = content
      .split('\n')
      .filter(line => !line.includes('<function='))
      .join('\n');

    const components = {
      h1: ({ children }: any) => (
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
          💰 {children}
        </h1>
      ),
      h2: ({ children }: any) => (
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
          📊 {children}
        </h2>
      ),
      h3: ({ children }: any) => (
        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2 flex items-center">
          📈 {children}
        </h3>
      ),
      p: ({ children }: any) => (
        <p className="text-sm leading-relaxed text-gray-900 dark:text-white mb-2">{children}</p>
      ),
      ul: ({ children }: any) => (
        <ul className="list-none space-y-1 mb-3">{children}</ul>
      ),
      ol: ({ children }: any) => (
        <ol className="list-decimal list-inside space-y-1 mb-3 text-gray-900 dark:text-white">{children}</ol>
      ),
      li: ({ children }: any) => (
        <li className="text-sm text-gray-900 dark:text-white flex items-start">
          <span className="text-blue-500 mr-2">•</span>
          <span>{children}</span>
        </li>
      ),
      strong: ({ children }: any) => (
        <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>
      ),
      a: ({ href, children }: any) => (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
        >
          {children}
        </a>
      ),
      code: ({ inline, className, children, ...props }: any) => {
        const match = /language-(\w+)/.exec(className || '');
        const language = match ? match[1] : '';
        
        if (inline) {
          return (
            <code className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-1 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          );
        }
        
        return (
          <div className="my-3">
            {language && (
              <div className="bg-gray-800 text-gray-300 px-3 py-1 text-xs font-medium rounded-t-md border-b border-gray-600">
                {language.toUpperCase()}
              </div>
            )}
            <SyntaxHighlighter
              style={oneDark}
              language={language || 'text'}
              PreTag="div"
              className="!mt-0 !rounded-t-none"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          </div>
        );
      },
      blockquote: ({ children }: any) => (
        <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300 italic mb-3">
          {children}
        </blockquote>
      ),
    };

    return (
       <div className="prose prose-sm max-w-none">
         <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
           {cleanContent}
         </ReactMarkdown>
       </div>
     );
  }

  return (
    <div className="space-y-4">
      {/* Stock Header */}
      {(stockData.symbol || stockData.companyName) && (
        <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-600">
          <BuildingOfficeIcon className="w-6 h-6 text-blue-500" />
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              {stockData.companyName || stockData.symbol}
            </h3>
            {stockData.symbol && stockData.companyName && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{stockData.symbol}</p>
            )}
          </div>
        </div>
      )}

      {/* Price Information */}
      {stockData.price && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Price</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stockData.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stockData.marketCap && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Market Cap</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">${stockData.marketCap}</p>
          </div>
        )}
        
        {stockData.pe && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">P/E Ratio</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{stockData.pe}</p>
          </div>
        )}
        
        {stockData.eps && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">EPS</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">${stockData.eps}</p>
          </div>
        )}
        
        {stockData.sector && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Sector</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{stockData.sector}</p>
          </div>
        )}
      </div>

      {/* Company Info */}
      {stockData.industry && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Company Information</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Industry:</span> {stockData.industry}
          </p>
        </div>
      )}

      {/* Analyst Recommendations */}
      {stockData.recommendations && stockData.recommendations.length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-purple-500" />
            Analyst Recommendations
          </h4>
          <div className="space-y-2">
            {stockData.recommendations.map((rec, index) => (
              <div key={index} className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-800 rounded-md">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{rec.firm}</span>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  rec.rating.toLowerCase().includes('buy') ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  rec.rating.toLowerCase().includes('sell') ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {rec.rating}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw content for any additional information */}
      <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
        <details className="cursor-pointer">
          <summary className="font-medium text-gray-900 dark:text-white mb-2">Full Response</summary>
          <div className="text-xs leading-relaxed text-gray-600 dark:text-gray-300 prose prose-xs max-w-none">
            <ReactMarkdown 
              components={{
                p: ({ children }: any) => <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">{children}</p>,
                h1: ({ children }: any) => <h1 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">{children}</h1>,
                h2: ({ children }: any) => <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">{children}</h2>,
                h3: ({ children }: any) => <h3 className="text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">{children}</h3>,
                strong: ({ children }: any) => <strong className="font-semibold text-gray-700 dark:text-gray-200">{children}</strong>,
                code: ({ inline, children }: any) => {
                  if (inline) {
                    return <code className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-1 rounded text-xs">{children}</code>;
                  }
                  return <pre className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 p-2 rounded text-xs overflow-x-auto"><code>{children}</code></pre>;
                },
                ul: ({ children }: any) => <ul className="list-disc list-inside text-xs space-y-0.5">{children}</ul>,
                ol: ({ children }: any) => <ol className="list-decimal list-inside text-xs space-y-0.5">{children}</ol>,
                li: ({ children }: any) => <li className="text-xs text-gray-600 dark:text-gray-300">{children}</li>,
              }}
            >
              {content.split('\n').filter(line => !line.includes('<function=')).join('\n')}
            </ReactMarkdown>
          </div>
        </details>
      </div>
    </div>
  );
};

export default FinancialDataDisplay;