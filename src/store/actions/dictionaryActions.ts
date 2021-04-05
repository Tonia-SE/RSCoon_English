import { Dispatch } from 'redux';
import backendUrl from '../../constants';
import { DictionaryActionTypes, IUserData, IUserWord, IWord } from '../types';

const splitDictionaryWords = (loadedWords: { paginatedResults: Array<IUserWord> }[]) => {
  const acc = {
    learningWords: [] as Array<IUserWord>,
    difficultWords: [] as Array<IUserWord>,
    deletedWords: [] as Array<IUserWord>,
  };
  loadedWords[0].paginatedResults.reduce((accum, word) => {
    if (word.userWord?.optional.deleted) {
      accum.deletedWords.push(word);
    }
    if (word.userWord?.difficulty === 'hard') {
      accum.difficultWords.push(word);
    }
    if (!word.userWord?.optional.deleted) {
      accum.learningWords.push(word);
    }
    return accum;
  }, acc);
  return acc;
};

const getSuccessHeats = (word: IWord): number => {
  return ((<IUserWord>word).userWord && (<IUserWord>word).userWord?.optional.successHeats) || 0;
};

const getErrorHeats = (word: IWord): number => {
  return ((<IUserWord>word).userWord && (<IUserWord>word).userWord?.optional.errorHeats) || 0;
};

// const getDeleted = (word: IWord): boolean => {
//   return ((<IUserWord>word).userWord && (<IUserWord>word).userWord?.optional.deleted) || false;
// };

const getDifficulty = (word: IWord): string => {
  return ((<IUserWord>word).userWord && (<IUserWord>word).userWord?.difficulty) || 'easy';
};

const startDictLoading = () => ({
  type: DictionaryActionTypes.DICT_IS_LOADING,
  payload: { isLoading: true },
});

const fetchDictSuccess = (words: { paginatedResults: Array<IUserWord> }[]) => ({
  type: DictionaryActionTypes.FETCH_SUCCESS,
  payload: { ...splitDictionaryWords(words), isLoading: false },
});

const setEmptyDictionary = () => ({
  type: DictionaryActionTypes.FETCH_SUCCESS,
  payload: {
    easyWords: [] as Array<IUserWord>,
    difficultWords: [] as Array<IUserWord>,
    deletedWords: [] as Array<IUserWord>,
    isLoading: false,
  },
});

const fetchDictError = (error: Error) => ({
  type: DictionaryActionTypes.FETCH_ERROR,
  payload: { error, isLoading: false },
});

export const fetchDictionary = (userData: IUserData) => async (dispatch: Dispatch) => {
  const fetchUserId = userData.userId;
  // eslint-disable-next-line max-len
  const url = `${backendUrl}/users/${fetchUserId}/aggregatedWords?wordsPerPage=3600&filter={"userWord":{"$exists": true}}`;
  const userToken = userData.token;

  if (!userToken) {
    dispatch(setEmptyDictionary());
    return;
  }
  dispatch(startDictLoading());
  try {
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'omit',
      headers: {
        Authorization: `Bearer ${userToken}`,
        Accept: 'application/json',
      },
    });
    const words = await res.json();
    dispatch(fetchDictSuccess(words));
  } catch (e) {
    dispatch(fetchDictError(e));
  }
};

const sendUserWord = (
  word: IWord,
  userData: IUserData,
  difficulty: string,
  deleted: boolean,
  isNew: boolean
) => (dispatch: Dispatch) => {
  const fetchUserId = userData.userId;
  const userToken = userData.token;
  // eslint-disable-next-line no-underscore-dangle
  const url = `${backendUrl}/users/${fetchUserId}/words/${word.id || (<IUserWord>word)._id}`;
  const method = isNew ? 'POST' : 'PUT';

  const successHeats = getSuccessHeats(word);
  const errorHeats = getErrorHeats(word);

  dispatch(startDictLoading());
  try {
    fetch(url, {
      method,
      credentials: 'omit',
      headers: {
        Authorization: `Bearer ${userToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        difficulty,
        optional: { deleted, successHeats, errorHeats },
      }),
    })
      .then(() => fetchDictionary(userData)(dispatch))
      .catch((error) => dispatch(fetchDictError(error)));
  } catch (e) {
    dispatch(fetchDictError(e));
  }
};

export const saveUserWord = (
  word: IWord,
  userData: IUserData,
  difficulty: string,
  deleted: boolean
) => (dispatch: Dispatch) => {
  sendUserWord(word, userData, difficulty, deleted, true)(dispatch);
};

export const setUserWordData = (
  word: IUserWord,
  userData: IUserData,
  difficulty: string,
  deleted: boolean
) => (dispatch: Dispatch) => {
  sendUserWord(word, userData, difficulty, deleted, false)(dispatch);
};

export const setUserWordEasy = (word: IWord, userData: IUserData) => async (dispatch: Dispatch) => {
  if ((<IUserWord>word).userWord === undefined) {
    saveUserWord(word, userData, 'easy', false)(dispatch);
  } else {
    setUserWordData(word, userData, 'easy', false)(dispatch);
  }
};

export const setUserWordHard = (word: IWord, userData: IUserData) => async (dispatch: Dispatch) => {
  if ((<IUserWord>word).userWord === undefined) {
    saveUserWord(word, userData, 'hard', false)(dispatch);
  } else {
    setUserWordData(word, userData, 'hard', false)(dispatch);
  }
};

export const setUserWordDeleted = (word: IWord, userData: IUserData, deleted: boolean) => async (
  dispatch: Dispatch
) => {
  const difficulty = getDifficulty(word);

  if ((<IUserWord>word).userWord === undefined) {
    saveUserWord(word, userData, difficulty, deleted)(dispatch);
  } else {
    setUserWordData(word, userData, difficulty, deleted)(dispatch);
  }
};

export const addWordsToUserDictionary = (words: Array<IWord>, userData: IUserData) => async (
  dispatch: Dispatch
) => {
  const unsavedWords = words.filter((word) => (<IUserWord>word).userWord === undefined);

  unsavedWords.forEach((word) => saveUserWord(word, userData, 'easy', true)(dispatch));
};
