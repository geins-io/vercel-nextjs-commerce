"use client";

import Prose from 'components/prose';
import { useEffect, useRef } from 'react';

export default function PageClient({ page }: { page: any }) {
  const scriptContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scriptContainerRef.current) {
      const container = document.createElement('div');
      container.innerHTML = page.body;

      const scriptTags = container.querySelectorAll('script');

      scriptTags.forEach((scriptTag) => {
        const newScript = document.createElement('script');
        if (scriptTag.src) {
          // External script
          newScript.src = scriptTag.src;
          newScript.async = true;
        } else {
          // Inline script
          newScript.textContent = scriptTag.innerHTML;
        }

        // Append the script to the container
        scriptContainerRef.current?.appendChild(newScript);
      });
    }
  }, [page]);

  return (
    <>
      <h1 className="mb-8 text-5xl font-bold">{page.title}</h1>
      {/* Render the page body */}
      <Prose className="mb-8" html={page.body} />
      {/* Container for dynamically injected scripts */}
      <div id="checkout-external" ref={scriptContainerRef}></div>
    </>
  );
}
