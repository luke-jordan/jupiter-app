import { UPDATE_ALL_SNIPPETS, ADD_SNIPPETS, INCREMENT_VIEW_COUNT } from './snippet.actions';

export const STATE_KEY = 'snippet';
export const FALLBACK_SNIPPET_ID = 'FALLBACK_SNIPPET';

const FALLBACK_SNIPPET = {
  title: 'Did you know?',
  body: 'Put R50 a month into Jupiter, and by year 3 your interest will buy you a Streetwise Bucket! Compound interest-finger licking good',
  active: true,
  snippetId: FALLBACK_SNIPPET_ID,
  viewCount: 1, // so goes to the back as soon as any comes int
  snippetPriority: 0, 
};

const initialState = {
  snippets: [FALLBACK_SNIPPET],
};

const snippetReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_ALL_SNIPPETS: {
      const { snippets } = action;
      return { ...state, snippets };
    }

    case ADD_SNIPPETS: {
      const { snippets: newSnippets } = action;
      const newSnippetIds = newSnippets.map((snippet) => snippet.snippetId);
      const oldSnippets = state.snippets || [];
      // just to avoid some duplications in case hit twice before updates etc
      const dedupedSnippets = oldSnippets.filter((snippet) => !newSnippetIds.includes(snippet.snippetId));
      const updatedSnippets = [...newSnippets, ...dedupedSnippets];
      return { ...state, snippets: updatedSnippets };
    }

    case INCREMENT_VIEW_COUNT: {
      // console.log('Incrementing snippet view count: ', action);
      const { snippetId: snippetToUpdateId } = action;
      const snippetToUpdate = state.snippets.find((snippet) => snippet.snippetId === snippetToUpdateId);
      // console.log('Found snippet: ', snippetToUpdate);

      if (!snippetToUpdate) {
        return state;
      }

      const updatedSnippet = { ...snippetToUpdate, viewCount: snippetToUpdate.viewCount + 1 };
      const otherSnippets = state.snippets ? state.snippets.filter((snippet) => snippet.snippetId !== snippetToUpdateId) : [];
      const updatedSnippets = [...otherSnippets, updatedSnippet];
      return { ...state, snippets: updatedSnippets };
    }

    default: {
      return state;
    }
  }
};

export const getSnippets = state => state[STATE_KEY].snippets;

// view count dominates (ascending - lowest view count first), then priority (descending - highest priority first) 
const snippetSorter = (snippetA, snippetB) => {
  if (snippetA.viewCount !== snippetB.viewCount) {
    return snippetA.viewCount - snippetB.viewCount;
  }

  return snippetB.snippetPriority - snippetA.snippetPriority;
}

export const getSortedSnippets = state => {
  const { snippets } = state[STATE_KEY];
  // console.log('Getting sorted snippets: ', snippets);
  if (!snippets) {
    return [FALLBACK_SNIPPET];
  }

  // const activeSnippets = snippets.filter(snippet => snippet.active);
  const activeSnippets = snippets;

  if (activeSnippets.length === 0) {
    return [FALLBACK_SNIPPET];
  }

  return activeSnippets.sort(snippetSorter);
};

export default snippetReducer;
