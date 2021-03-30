import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Transition, TransitionStatus } from 'react-transition-group';
import Parser from 'html-react-parser';
import { Typography, Card, Chip, useTheme } from '@material-ui/core';
import { Done, VolumeUpRounded, StopRounded } from '@material-ui/icons';
import { setUserWordDeleted, setUserWordHard } from '../../store/actions/dictionaryActions';
import { deleteWordFromGamesStore } from '../../store/actions/gamesActions';
import backendUrl, {
  APPEAR_DURATION,
  APPEAR_STYLE,
  WORDBOOK_GROUPS,
  WORDCARD_APPEAR_GAP,
} from '../../constants';
import { IAppState } from '../../store/types';
import { IWordCardProps } from './types';
import useStyles, { defaultImageSize, transitionStyles } from './styles';

const WordCard: React.FC<IWordCardProps> = ({ word, index }: IWordCardProps) => {
  const classes = useStyles();
  const [isMounted, setIsMounted] = useState(false);
  const { isLoading } = useSelector((state: IAppState) => state.wordBook);
  const { data: userData } = useSelector((state: IAppState) => state.user);
  const [isImageReady, setImageIsReady] = useState(false);
  const audio = useMemo(() => new Audio(), []);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [playingAudioIndex, setPlayingAudioIndex] = useState(-1);
  const dispatch = useDispatch();
  const activeGroup = useSelector((state: IAppState) => state.wordBook.activeGroup);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isDifficult, setIsDifficult] = useState(false);
  const { color } = WORDBOOK_GROUPS[activeGroup];
  const highlightStyle = { color };
  const theme = useTheme();
  const colorOfDifficult = theme.palette.secondary.main;

  const textStyle = {
    word: playingAudioIndex === 0 ? highlightStyle : {},
    meaning: playingAudioIndex === 1 ? highlightStyle : {},
    example: playingAudioIndex === 2 ? highlightStyle : {},
  };

  const difficultStyle = {
    filter: isDifficult ? `drop-shadow(0 0 3px ${colorOfDifficult})` : '',
  };

  const preloadImage = (): void => {
    const img = new Image();
    img.onload = (): void => setImageIsReady(true);
    img.src = `${backendUrl}/${word.image}`;
  };

  const playAudio = (src: string, audioIndex: number) => {
    setIsAudioPlaying(true);
    setPlayingAudioIndex(audioIndex);
    audio.src = `${backendUrl}/${src}`;
    audio.play();
  };

  const renderButton = (
    label: string,
    altLabel: string,
    clickHandler: () => void,
    param?: boolean
  ) => (
    <Chip
      className={classes.button}
      variant={param ? 'default' : 'outlined'}
      color={param ? 'secondary' : 'default'}
      size="small"
      deleteIcon={param ? <Done /> : <></>}
      clickable
      label={param ? altLabel : label}
      onClick={clickHandler}
      onDelete={clickHandler} // necessary for deleteIcon to be rendered
    />
  );

  const handleAudioClick = () => {
    playAudio(word.audio, 0);
    audio.onended = () => {
      playAudio(word.audioMeaning, 1);
      audio.onended = () => {
        playAudio(word.audioExample, 2);
        audio.onended = () => {
          setIsAudioPlaying(false);
          setPlayingAudioIndex(-1);
        };
      };
    };
  };

  const handleStopClick = () => {
    audio.pause();
    setIsAudioPlaying(false);
    setPlayingAudioIndex(-1);
  };

  const handleAddToDifficult = () => {
    dispatch(setUserWordHard(word, userData));
    if (isDifficult) setIsDifficult(false);
    else setIsDifficult(true);
  };

  const handleDelete = () => {
    dispatch(setUserWordDeleted(word, userData, true));
    dispatch(deleteWordFromGamesStore(word));

    setIsMounted(false);
    setTimeout(() => {
      setIsDeleted(true);
    }, APPEAR_DURATION);
  };

  useEffect(() => {
    const delay = WORDCARD_APPEAR_GAP * index;
    const cardAppearTimeout = setTimeout(() => setIsMounted(true), delay);
    preloadImage();

    return () => {
      clearTimeout(cardAppearTimeout);
      setIsMounted(false);
      handleStopClick();
    };
  }, []);

  return (
    <Transition in={isMounted && !isLoading} timeout={APPEAR_DURATION} unmountOnExit>
      {(state: TransitionStatus) => (
        <Card
          className={classes.card}
          style={{ ...APPEAR_STYLE, ...difficultStyle, ...transitionStyles[state] }}>
          <img
            src={`${backendUrl}/${word.image}`}
            alt={word.word}
            width={defaultImageSize.width}
            height={defaultImageSize.height}
            className={classes.image}
            style={isImageReady ? { opacity: 1 } : {}}
          />
          <Typography className={classes.word}>
            <span style={textStyle.word}>{word.word}</span>
            {' — '}
            <span className={classes.wordTranslate}>{word.wordTranslate}</span>
          </Typography>
          <Typography className={classes.transcription}>
            {` ${word.transcription} `}
            <VolumeUpRounded
              onClick={handleAudioClick}
              color={isAudioPlaying ? 'disabled' : 'action'}
              className={classes.icon}
            />
            {isAudioPlaying && (
              <StopRounded onClick={handleStopClick} color="error" className={classes.icon} />
            )}
          </Typography>
          <Typography variant="body2">
            Meaning: <span style={textStyle.meaning}>{Parser(word.textMeaning)}</span>
          </Typography>
          <Typography variant="body2" color="textSecondary" className={classes.secondary}>
            (Значение: {Parser(word.textMeaningTranslate)})
          </Typography>
          <Typography variant="body2">
            Example: <span style={textStyle.example}>{Parser(word.textExample)}</span>
          </Typography>
          <Typography variant="body2" color="textSecondary" className={classes.secondary}>
            (Пример: {Parser(word.textExampleTranslate)})
          </Typography>
          {renderButton(
            'Добавить в сложные',
            'Добавлено в сложные',
            handleAddToDifficult,
            isDifficult
          )}
          {renderButton('В удалённые', 'Удалено', handleDelete, isDeleted)}
        </Card>
      )}
    </Transition>
  );
};

export default WordCard;
