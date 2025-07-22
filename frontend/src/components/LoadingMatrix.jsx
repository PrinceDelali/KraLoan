import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LoadingMatrix = ({ message = "Initializing system..." }) => {
  const [matrixChars, setMatrixChars] = useState([]);
  const [currentChar, setCurrentChar] = useState(0);

  const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  const matrixColors = ['#00ff00', '#00dd00', '#00bb00', '#009900', '#007700'];

  useEffect(() => {
    const chars = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      char: characters[Math.floor(Math.random() * characters.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: Math.random() * 2 + 1,
      color: matrixColors[Math.floor(Math.random() * matrixColors.length)],
      opacity: Math.random() * 0.8 + 0.2,
      size: Math.random() * 10 + 8
    }));
    setMatrixChars(chars);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMatrixChars(prev => prev.map(char => ({
        ...char,
        char: characters[Math.floor(Math.random() * characters.length)],
        opacity: Math.random() * 0.8 + 0.2
      })));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Matrix rain effect */}
      <div className="absolute inset-0">
        {matrixChars.map((char) => (
          <motion.div
            key={char.id}
            className="absolute font-mono"
            style={{
              left: `${char.x}%`,
              top: `${char.y}%`,
              color: char.color,
              fontSize: char.size,
              opacity: char.opacity,
            }}
            animate={{
              y: [0, 100],
              opacity: [char.opacity, 0],
            }}
            transition={{
              duration: char.speed * 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {char.char}
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Digital logo */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="w-24 h-24 mx-auto border-2 border-green-500 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <motion.div
              className="text-3xl text-green-500 font-mono"
              animate={{
                textShadow: [
                  '0 0 5px #00ff00',
                  '0 0 20px #00ff00',
                  '0 0 5px #00ff00'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              K
            </motion.div>
          </div>
        </motion.div>

        {/* Loading text */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <h2 className="text-2xl font-mono text-green-500 mb-2 font-bold">
            KRA_LOAN_SYSTEM
          </h2>
          <p className="text-green-400 text-lg font-mono">
            {message}
          </p>
        </motion.div>

        {/* Digital progress bar */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <div className="w-80 h-3 bg-black border border-green-500 mx-auto overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-green-300"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Binary loading indicator */}
        <motion.div
          className="flex justify-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-green-500 rounded-sm"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>

        {/* Status text */}
        <motion.div
          className="mt-6 text-green-400 text-sm font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
        >
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {'>'} Initializing secure connection...
          </motion.p>
        </motion.div>
      </div>

      {/* Corner elements */}
      <div className="absolute top-4 left-4 w-8 h-8 border border-green-500">
        <motion.div
          className="w-full h-full bg-green-500/20"
          animate={{
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      <div className="absolute bottom-4 right-4 w-8 h-8 border border-green-500">
        <motion.div
          className="w-full h-full bg-green-500/20"
          animate={{
            opacity: [0.8, 0.2, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </div>
  );
};

export default LoadingMatrix; 