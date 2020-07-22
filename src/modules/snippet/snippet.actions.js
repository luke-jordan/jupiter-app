export const namespace = 'SNIPPET';

export const UPDATE_ALL_SNIPPETS = `${namespace}/UPDATE_ALL_SNIPPETS`;
export const ADD_SNIPPETS = `${namespace}/ADD_SNIPPETS`;
export const INCREMENT_VIEW_COUNT = `${namespace}/INCREMENT_VIEW_COUNT`;

export const updateAllSnippets = snippets => ({
  type: UPDATE_ALL_SNIPPETS,
  snippets,
});

export const addSnippets = snippets => ({
  type: ADD_SNIPPETS,
  snippets,
});

export const incrementSnippetViewCount = snippetId => ({
  type: INCREMENT_VIEW_COUNT,
  snippetId,  
})