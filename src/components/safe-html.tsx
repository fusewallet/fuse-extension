import DOMPurify from 'dompurify';
import { memo, useMemo, useState } from 'react';

function SafeHtml({ html }: { html: string }) {
    const sanitizedHtml = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['p', 'a', 'b', 'i', 'em', 'strong', 'br'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
    });

    return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}

interface ExpandableHtmlProps {
    description: string;
    maxLength?: number;
    className?: string;
}

const ExpandableHtml = memo(({ description, maxLength = 200, className = '' }: ExpandableHtmlProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const { truncatedText, shouldTruncate } = useMemo(() => {
        // Get plain text for truncation
        const div = document.createElement('div');
        div.innerHTML = DOMPurify.sanitize(description);
        const fullText = div.textContent || '';

        return {
            truncatedText: fullText.length > maxLength ? fullText.slice(0, maxLength) : fullText,
            shouldTruncate: fullText.length > maxLength,
        };
    }, [description, maxLength]);

    return (
        <div className={`text-sm ${className}`}>
            <div className="inline">
                <SafeHtml html={isExpanded ? description : `<p>${truncatedText}</p>`} />
            </div>
            {shouldTruncate && (
                <>
                    {!isExpanded && '...'}
                    <span className="ml-2 cursor-pointer text-[#FFCF13]" onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? 'Less' : 'More'}
                    </span>
                </>
            )}
        </div>
    );
});

export { SafeHtml, ExpandableHtml };
