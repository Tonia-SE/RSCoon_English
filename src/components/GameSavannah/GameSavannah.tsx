import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useFullScreenHandle } from 'react-full-screen';
import SavannahGamePlay from './SavannahGamePlay';
import SavannahStartWindow from './SavannahStartWindow';
import { FullScreenWrapper, FullScreenBtn } from '../commonComponents';
import Header from '../Header';
import { IAppState } from '../../store/types';
import useStyles from './styles';

const GameSavannah: React.FC = () => {
  const savannahData = useSelector((state: IAppState) => state.savannah);
  const [fullSize, setFullSize] = useState(false);
  const classes = useStyles();
  const handle = useFullScreenHandle();
  const fullScreenClass = fullSize ? ` ${classes.wrapperFull}` : ` ${classes.wrapperNotFull}`;

  const handleFullSize = () => {
    setFullSize(!fullSize);
    return fullSize ? handle.exit() : handle.enter();
  };

  const gameComponent = (
    <>
      <div className={`${classes.savannahWrapper}${fullScreenClass}`}>
        {!savannahData.isStartGame ? <SavannahStartWindow /> : <SavannahGamePlay />}
      </div>
      <FullScreenBtn changeScreen={handleFullSize} />
    </>
  );

  return (
    <>
      <Header />
      <FullScreenWrapper component={gameComponent} handle={handle} />
    </>
  );
};

export default GameSavannah;
