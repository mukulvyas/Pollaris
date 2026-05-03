import React from 'react';
import PropTypes from 'prop-types';

const Skeleton = ({ className, height, width, circle }) => {
  return (
    <div 
      className={`animate-pulse bg-gray-200 ${circle ? 'rounded-full' : 'rounded-md'} ${className}`}
      style={{ 
        height: height || '1rem', 
        width: width || '100%',
        display: 'inline-block'
      }}
    />
  );
};

Skeleton.propTypes = {
  className: PropTypes.string,
  height: PropTypes.string,
  width: PropTypes.string,
  circle: PropTypes.bool,
};

export default Skeleton;
