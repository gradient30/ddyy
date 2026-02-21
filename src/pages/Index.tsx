import React from 'react';
import { useGame } from '@/contexts/GameContext';
import ProfileSelect from '@/components/profile/ProfileSelect';
import IslandMap from '@/components/map/IslandMap';
import GlobalNav from '@/components/nav/GlobalNav';
import RestMode from '@/components/timer/RestMode';

const Index: React.FC = () => {
  const { state, isResting } = useGame();

  if (isResting) return <RestMode />;
  if (state.currentProfileId === null) return <ProfileSelect />;

  return (
    <>
      <GlobalNav />
      <IslandMap />
    </>
  );
};

export default Index;
