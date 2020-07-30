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
  snippetViewedTimes: {},
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
      
      const snippetViewedTimes = { ...state.snippetViewedTimes };
      snippetViewedTimes[snippetToUpdateId] = Date.now();

      return { ...state, snippets: updatedSnippets, snippetViewedTimes };
    }

    default: {
      return state;
    }
  }
};

export const getSnippets = state => state[STATE_KEY].snippets;

// if one snippet has never been viewed, show it; if both viewed; show the one that was viewed last (i.e., sort ascending)
// view count dominates (earliest first), then (ascending - lowest view count first), then priority (descending - highest priority first) 
const snippetOnlySort = (snippetA, snippetB) => {
  if (snippetA.viewCount !== snippetB.viewCount) {
    return snippetA.viewCount - snippetB.viewCount;
  }

  return snippetB.snippetPriority - snippetA.snippetPriority;
}

const snippetSorter = (snippetA, snippetB, snippetViewedTimes) => {
  if (!snippetViewedTimes) {
    // console.log('NO SNIPPET VIEWED TIMES');
    return snippetOnlySort(snippetA, snippetB);
  }
  const lastViewTimeA = snippetViewedTimes[snippetA.snippetId];
  const lastViewTimeB = snippetViewedTimes[snippetB.snippetId];

  const hasAbeenViewed = typeof lastViewTimeA === 'number' && lastViewTimeA > 0;
  const hasBbeenViewed = typeof lastViewTimeB === 'number' && lastViewTimeB > 0
  
  // console.log(`A::${snippetA.snippetId} viewed: ${hasAbeenViewed}, B::${snippetB.snippetId} viewed: ${hasBbeenViewed}`);

  if (hasAbeenViewed && hasBbeenViewed) {
    return lastViewTimeA - lastViewTimeB;
  }

  // at least one has not been viewed
  if (!hasAbeenViewed || !hasBbeenViewed) {
    return hasAbeenViewed ? 1 : -1; // i.e., put A first if it has not been viewed
  }

  // neither viewed in current state, go by server view count or priority
  return snippetOnlySort(snippetA, snippetB);
}

export const getSortedSnippets = state => {
  const { snippets, snippetViewedTimes } = state[STATE_KEY];
  // console.log('Getting sorted snippet viewed times: ', snippetViewedTimes);
  // console.log('View counts: ', snippets.map(({ snippetId, viewCount }) => `${snippetId}::${viewCount}`));
  if (!snippets) {
    return [FALLBACK_SNIPPET];
  }

  // const activeSnippets = snippets.filter(snippet => snippet.active);
  const activeSnippets = snippets;

  if (activeSnippets.length === 0) {
    return [FALLBACK_SNIPPET];
  }

  return activeSnippets.sort((snippetA, snippetB) => snippetSorter(snippetA, snippetB, snippetViewedTimes));
};

export default snippetReducer;
