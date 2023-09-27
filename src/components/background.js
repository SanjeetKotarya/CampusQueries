import React from 'react';
import video from '../videos/video.mp4'


const VideoBackground = () => {
  return (
    <div className="video-background">
      <video autoPlay loop muted>
        <source src={video} type="video/mp4" />
      </video>
      {/* Add other content on top of the video */}
    </div>
  );
};

export default VideoBackground;
