import React from 'react';
import { motion } from 'framer-motion';

const LoadingDots = ({ size = 'md', color = 'blue', variant = 'default' }) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    gray: 'bg-gray-600',
    purple: 'bg-purple-600',
    pink: 'bg-pink-600',
    yellow: 'bg-yellow-500'
  };

  const gradientClasses = {
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
    green: 'bg-gradient-to-r from-green-500 to-green-600',
    red: 'bg-gradient-to-r from-red-500 to-red-600',
    gray: 'bg-gradient-to-r from-gray-500 to-gray-600',
    purple: 'bg-gradient-to-r from-purple-500 to-purple-600',
    pink: 'bg-gradient-to-r from-pink-500 to-pink-600',
    yellow: 'bg-gradient-to-r from-yellow-400 to-yellow-500'
  };

  if (variant === 'pulse') {
    return (
      <div className="flex justify-center space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`${sizeClasses[size]} ${gradientClasses[color]} rounded-full shadow-lg`}
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.3, 1, 0.3],
              boxShadow: [
                `0 0 0 0 ${colorClasses[color]}`,
                `0 0 0 8px ${colorClasses[color]}40`,
                `0 0 0 0 ${colorClasses[color]}`
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'wave') {
    return (
      <div className="flex justify-center space-x-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className={`${sizeClasses[size]} ${gradientClasses[color]} rounded-full`}
            animate={{
              y: [0, -15, 0],
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'orbit') {
    return (
      <div className="relative w-12 h-12">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`absolute ${sizeClasses[size]} ${gradientClasses[color]} rounded-full`}
            style={{
              left: '50%',
              top: '50%',
              marginLeft: `-${size === 'sm' ? '2px' : size === 'md' ? '4px' : '6px'}`,
              marginTop: `-${size === 'sm' ? '2px' : size === 'md' ? '4px' : '6px'}`,
            }}
            animate={{
              x: [0, Math.cos((i * 120) * Math.PI / 180) * 20, 0],
              y: [0, Math.sin((i * 120) * Math.PI / 180) * 20, 0],
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'spiral') {
    return (
      <div className="relative w-16 h-16">
        <motion.div
          className="absolute inset-0 border-2 border-transparent rounded-full"
          style={{
            borderTopColor: colorClasses[color],
          }}
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        <motion.div
          className="absolute inset-2 border-2 border-transparent rounded-full"
          style={{
            borderTopColor: gradientClasses[color].split(' ')[1],
          }}
          animate={{
            rotate: -360,
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
          }}
        />
        <motion.div
          className={`absolute inset-1/4 ${gradientClasses[color]} rounded-full`}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex justify-center space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${sizeClasses[size]} ${gradientClasses[color]} rounded-full shadow-md`}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
            y: [0, -3, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default LoadingDots; 