import React, { useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Ad } from '../../types';
import adsService from '../../services/adsService';

interface AdPlayerProps {
  ad: Ad;
  autoplay?: boolean;
  controls?: boolean;
  onEnded?: () => void;
}

const AdPlayer: React.FC<AdPlayerProps> = ({
  ad,
  autoplay = false,
  controls = true,
  onEnded,
}) => {
  useEffect(() => {
    // Increment view count when component mounts
    adsService.incrementView(ad.id).catch(console.error);
  }, [ad.id]);

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <ReactPlayer
        url={ad.video_url}
        width="100%"
        height="100%"
        playing={autoplay}
        controls={controls}
        onEnded={onEnded}
        config={{
          youtube: {
            playerVars: { showinfo: 1 }
          }
        }}
      />
    </div>
  );
};

export default AdPlayer;
