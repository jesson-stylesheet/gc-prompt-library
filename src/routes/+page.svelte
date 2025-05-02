<script lang="ts">
    import { supabase } from '$lib/supabaseClient';
    import type { PageData } from './$types';
  
    interface Prompt {
      id: number;
      title: string;
      prompt: string;
      use: string;
      tags: string[];
      updated_at: string;
    }
  
    export let data: PageData;
    let prompts: Prompt[] = data.prompts;
    let filtered: Prompt[] = [...prompts];
    let searchTerm = '';
    let currentFilter = 'all';
    let showModal = false;
  
    let newTitle = '';
    let newPromptText = '';
    let newUse = '';
    let newTagsInput = '';
  
    function updateFiltered() {
      const term = searchTerm.toLowerCase();
      filtered = prompts.filter(p => {
        const matchFilter = currentFilter === 'all' || p.tags.includes(currentFilter);
        const matchSearch = !term ||
          p.title.toLowerCase().includes(term) ||
          p.prompt.toLowerCase().includes(term) ||
          p.use.toLowerCase().includes(term);
        return matchFilter && matchSearch;
      });
    }
  
    function onSearch(e: Event) {
      searchTerm = (e.target as HTMLInputElement).value;
      updateFiltered();
    }
  
    function setFilter(filter: string) {
      currentFilter = filter;
      updateFiltered();
    }
  
    function openModal() {
      newTitle = '';
      newPromptText = '';
      newUse = '';
      newTagsInput = '';
      showModal = true;
    }
  
    function closeModal() {
      showModal = false;
    }
  
    async function savePrompt() {
      if (!newTitle || !newPromptText || !newUse) {
        alert('Please fill in Title, Prompt, and Use');
        return;
      }
  
      const tags = newTagsInput.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3);
      const { error } = await supabase
        .from('prompts')
        .insert([{ title: newTitle, prompt: newPromptText, use: newUse, tags }]);
  
      if (error) {
        console.error('Error saving prompt:', error);
        return;
      }
  
      // Append new prompt locally
      prompts = [{ id: -1, title: newTitle, prompt: newPromptText, use: newUse, tags, updated_at: new Date().toISOString() }, ...prompts];
      updateFiltered();
      closeModal();
    }
  </script>

<div>
    <header>
      <h1>GC PROMPT LIBRARY</h1>
    </header>
  
    <div class="controls">
      <input
        type="search"
        placeholder="Search prompts..."
        aria-label="Search prompts"
        on:input={onSearch}
        bind:value={searchTerm}
      />
      <div class="filter-buttons">
        {#each ['all', 'copywriting', 'image gen', 'admin', 'brainstorming'] as cat}
          <button class:active={currentFilter === cat} on:click={() => setFilter(cat)}>
            {cat}
          </button>
        {/each}
      </div>
    </div>
  
    <main class="prompt-cards-container">
      {#if filtered.length === 0}
        <p class="no-results">No prompts match your search or filter.</p>
      {:else}
        {#each filtered as p (p.id)} <div class="prompt-card">
            <h2>{p.title}</h2>
            <pre class="prompt-text-block">{p.prompt}</pre> <p class="use-text"><strong>Use:</strong> {p.use}</p>
            {#if p.tags && p.tags.length > 0}
              <div class="tags">
                {#each p.tags.slice(0, 3) as tag}
                  <span class="tag">{tag}</span>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      {/if}
    </main>
  
    <button class="add-btn" on:click={openModal} aria-label="Add new prompt">+</button>
  
    {#if showModal}
      <div
        class="modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabindex="-1"
        on:click={e => e.target === e.currentTarget && closeModal()}
        on:keydown={e => { if (e.key === 'Escape') closeModal(); }}
      >
        <div class="modal">
          <h3 id="modal-title">Add New Prompt</h3>
          <input placeholder="Title" aria-label="Prompt title" bind:value={newTitle} />
          <textarea placeholder="Prompt Text (supports multiple lines)" aria-label="Prompt text" rows="5" bind:value={newPromptText}></textarea>
          <input placeholder="Use Case (e.g., Blog post intro)" aria-label="Prompt use case" bind:value={newUse} />
          <input placeholder="Tags (comma-separated, max 3)" aria-label="Prompt tags" bind:value={newTagsInput} />
          <div class="modal-actions">
            <button class="button-primary" on:click={savePrompt}>Save Prompt</button>
            <button class="button-secondary" on:click={closeModal}>Cancel</button>
          </div>
        </div>
      </div>
    {/if}
</div>
  
  <style>
  /* Global styles are imported in +layout.svelte */
 
  :root {
    /* Color Palette */
    --color-primary: #4a90e2; /* A slightly softer blue */
    --color-primary-dark: #357ABD;
    --color-secondary: #50e3c2; /* A minty green/cyan */
    --color-background: #f8f9fa; /* Very light grey */
    --color-surface: #ffffff; /* Card backgrounds, modals */
    --color-text: #212529; /* Dark grey for text */
    --color-text-muted: #6c757d; /* Lighter grey for less important text */
    --color-border: #dee2e6; /* Borders */
    --color-border-light: #e9ecef;
    --color-accent: #f06595; /* Example accent for tags or highlights */
    --color-success: #48bb78;
    --color-error: #e53e3e;
    --color-shadow: rgba(0, 0, 0, 0.08);

    /* Typography */
    --font-family-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    --font-family-mono: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;

    /* Spacing */
    --space-xs: 0.25rem; /* 4px */
    --space-sm: 0.5rem;  /* 8px */
    --space-md: 1rem;    /* 16px */
    --space-lg: 1.5rem;  /* 24px */
    --space-xl: 2rem;    /* 32px */

    /* Borders */
    --border-radius-sm: 0.25rem;
    --border-radius-md: 0.5rem;
    --border-radius-lg: 0.75rem;
    --border-radius-pill: 9999px;

    /* Transitions */
    --transition-speed: 0.2s;
    --transition-ease: ease-in-out;
}

/* Apply base styles - assuming these might be in +layout.svelte otherwise apply to :global(body) */
/*
:global(body) {
    font-family: var(--font-family-sans);
    background-color: var(--color-background);
    color: var(--color-text);
    margin: 0;
    padding: var(--space-md);
    line-height: 1.6;
}
*/

header {
    text-align: center;
    margin-bottom: var(--space-lg);
    background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
    padding: var(--space-lg);
    border-radius: var(--border-radius-md);
    color: white;
    box-shadow: 0 4px 6px var(--color-shadow);
}

header h1 {
    margin: 0;
    font-weight: 600;
    letter-spacing: 1px;
}

.controls {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    margin-bottom: var(--space-lg);
}

.controls input[type=search] {
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-md);
    font-size: 1rem;
    transition: border-color var(--transition-speed) var(--transition-ease), box-shadow var(--transition-speed) var(--transition-ease);
}

.controls input[type=search]:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(var(--color-primary), 0.2); /* Focus ring */
}

.filter-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
}

.filter-buttons button {
    padding: var(--space-xs) var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-pill);
    background: var(--color-surface);
    color: var(--color-text-muted);
    cursor: pointer;
    font-size: 0.875rem;
    text-transform: capitalize;
    transition: background-color var(--transition-speed) var(--transition-ease), color var(--transition-speed) var(--transition-ease), border-color var(--transition-speed) var(--transition-ease);
}

.filter-buttons button:hover {
    background-color: var(--color-border-light);
    border-color: var(--color-border-light);
    color: var(--color-text);
}

.filter-buttons button.active {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
    font-weight: 500;
}

/* Responsive Controls for larger screens */
@media (min-width: 768px) {
    .controls {
        flex-direction: row;
        align-items: center;
        gap: var(--space-lg);
    }
    .controls input[type=search] {
        flex-grow: 1; /* Allow search bar to take available space */
    }
    .filter-buttons {
        flex-wrap: nowrap; /* Prevent wrapping on larger screens if space allows */
    }
}

.prompt-cards-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* Slightly larger min width */
    gap: var(--space-lg);
}

.prompt-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border-light);
    border-radius: var(--border-radius-md);
    box-shadow: 0 2px 4px var(--color-shadow);
    display: flex;
    flex-direction: column;
    padding: var(--space-md);
    transition: transform var(--transition-speed) var(--transition-ease), box-shadow var(--transition-speed) var(--transition-ease);
}

.prompt-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px var(--color-shadow);
}

.prompt-card h2 {
    font-size: 1.125rem; /* Slightly smaller */
    font-weight: 600;
    margin-top: 0;
    margin-bottom: var(--space-sm);
    color: var(--color-primary-dark);
}

.prompt-text-block {
    white-space: pre-wrap; /* Keep this */
    word-wrap: break-word; /* Keep this */
    background: var(--color-background);
    border: 1px solid var(--color-border-light);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--border-radius-sm);
    flex-grow: 1; /* Keep this */
    min-height: 6rem;
    font-family: var(--font-family-mono); /* Use monospace for code/prompts */
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--color-text-muted);
    margin-bottom: var(--space-md);
}

.use-text {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    margin-top: auto; /* Push tags down if card height varies */
    margin-bottom: var(--space-sm);
}
.use-text strong {
    color: var(--color-text); /* Make 'Use:' slightly darker */
}

.tags {
    margin-top: var(--space-sm);
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
}

.tag {
    display: inline-block;
    background: var(--color-border-light);
    color: var(--color-text-muted);
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--border-radius-pill);
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: lowercase;
}

/* Example: Different tag colors */
/* .tag:nth-child(odd) { background-color: var(--color-accent); color: white; } */

.add-btn {
    position: fixed;
    bottom: var(--space-lg);
    right: var(--space-lg);
    background: var(--color-success);
    color: white;
    border: none;
    width: 3.5rem; /* Slightly larger */
    height: 3.5rem;
    border-radius: var(--border-radius-pill);
    font-size: 1.75rem;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color var(--transition-speed) var(--transition-ease), transform var(--transition-speed) var(--transition-ease);
}

.add-btn:hover {
    background-color: #38a169; /* Darker green */
    transform: scale(1.05);
}

.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000; /* Ensure it's on top */
    opacity: 0;
    visibility: hidden;
    transition: opacity var(--transition-speed) var(--transition-ease), visibility var(--transition-speed) var(--transition-ease);
}

/* Apply styles when modal should be shown */
.modal-backdrop[role="dialog"] { /* Target more specifically */
    opacity: 1;
    visibility: visible;
}


.modal {
    background: var(--color-surface);
    padding: var(--space-lg);
    border-radius: var(--border-radius-lg);
    width: 90%;
    max-width: 32rem; /* Increased max width */
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    transform: scale(0.95);
    transition: transform var(--transition-speed) var(--transition-ease);
}

/* Apply styles when modal should be shown */
.modal-backdrop[role="dialog"] .modal {
    transform: scale(1);
}

.modal h3 {
    margin-top: 0;
    margin-bottom: var(--space-xs);
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-primary-dark);
    text-align: center;
}

.modal input,
.modal textarea {
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-sm);
    font-size: 1rem;
    font-family: var(--font-family-sans);
    transition: border-color var(--transition-speed) var(--transition-ease), box-shadow var(--transition-speed) var(--transition-ease);
}

.modal textarea {
    resize: vertical; /* Allow vertical resize only */
    min-height: 80px;
}

.modal input:focus,
.modal textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(var(--color-primary), 0.2); /* Focus ring */
}

.modal-actions {
    display: flex;
    gap: var(--space-sm);
    justify-content: flex-end; /* Align buttons to the right */
    margin-top: var(--space-sm);
}

.modal button {
    padding: var(--space-sm) var(--space-lg);
    border: none;
    border-radius: var(--border-radius-sm);
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: background-color var(--transition-speed) var(--transition-ease), opacity var(--transition-speed) var(--transition-ease);
}

.modal button.button-primary {
    background: var(--color-primary);
    color: white;
}
.modal button.button-primary:hover {
    background: var(--color-primary-dark);
}

.modal button.button-secondary {
    background: var(--color-border-light);
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
}
.modal button.button-secondary:hover {
    background: var(--color-border);
    color: var(--color-text);
}

.no-results {
    grid-column: 1 / -1; /* Span full width */
    text-align: center;
    color: var(--color-text-muted);
    font-style: italic;
    padding: var(--space-xl);
    background-color: var(--color-surface);
    border-radius: var(--border-radius-md);
    border: 1px dashed var(--color-border);
}

  </style>