// Simple icon generator for AlphaHunters
// This creates a basic icon - for production, use a proper graphics tool

const fs = require('fs');
const { createCanvas } = require('canvas');

// Check if canvas is installed
try {
    require.resolve('canvas');
} catch(e) {
    console.log('Canvas module not found. Installing...');
    require('child_process').execSync('npm install canvas', {stdio: 'inherit'});
}

const canvas = createCanvas(256, 256);
const ctx = canvas.getContext('2d');

// Background gradient
const gradient = ctx.createLinearGradient(0, 0, 256, 256);
gradient.addColorStop(0, '#4CAF50');
gradient.addColorStop(1, '#2196F3');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 256, 256);

// Circle background
ctx.beginPath();
ctx.arc(128, 128, 100, 0, Math.PI * 2);
ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
ctx.fill();

// Letter "A"
ctx.fillStyle = '#333';
ctx.font = 'bold 120px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('A', 128, 128);

// Save as PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('icon.png', buffer);
console.log('Created icon.png');

console.log('\nNote: You still need to:');
console.log('1. Convert icon.png to icon.ico for Windows');
console.log('2. Convert icon.png to icon.icns for macOS');
console.log('3. Or use placeholder files for now');