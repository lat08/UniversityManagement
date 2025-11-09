'use client';

import { useRouter } from 'next/navigation';
import { useRef } from 'react';

interface MarkdownTextProps {
  text: string;
  className?: string;
}

export function MarkdownText({ text, className = '' }: MarkdownTextProps) {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);

  // Parse markdown-like syntax to React elements
  const parseMarkdown = (content: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Match markdown links: [Text](URL)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {
      // Add text before link
      if (match.index > lastIndex) {
        const textBefore = content.substring(lastIndex, match.index);
        parts.push(...parseTextFormatting(textBefore));
      }
      
      // Add button for internal links
      const linkText = match[1];
      const linkUrl = match[2];
      const isInternal = linkUrl.startsWith('/');
      
      if (isInternal) {
        parts.push(
          <button
            key={`link-${match.index}`}
            onClick={() => router.push(linkUrl)}
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            {linkText}
          </button>
        );
      } else {
        parts.push(
          <a
            key={`link-${match.index}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {linkText}
          </a>
        );
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < content.length) {
      const remainingText = content.substring(lastIndex);
      parts.push(...parseTextFormatting(remainingText));
    }
    
    return parts.length > 0 ? parts : parseTextFormatting(content);
  };
  
  // Parse text formatting (bold, italic, line breaks)
  const parseTextFormatting = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const lines = text.split('\n');
    
    lines.forEach((line, lineIdx) => {
      if (lineIdx > 0) {
        parts.push(<br key={`br-${lineIdx}`} />);
      }
      
      // Parse bold: **text**
      const boldRegex = /\*\*([^*]+)\*\*/g;
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={`bold-${match.index}`}>{match[1]}</strong>);
        lastIndex = match.index + match[0].length;
      }
      
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }
    });
    
    return parts;
  };

  return (
    <div 
      ref={contentRef}
      className={`markdown-content ${className}`}
    >
      {parseMarkdown(text)}
    </div>
  );
}
