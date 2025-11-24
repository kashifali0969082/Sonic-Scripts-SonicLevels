// Next.js Instrumentation - Server startup pe automatically execute hoga
// This file ensures MongoDB connects when Next.js server starts

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side pe MongoDB connection initialize karo
    const { testConnection } = await import('./lib/mongod');
    const { connectMongoose } = await import('./lib/mongoose');
    
    try {
      console.log('🚀 Next.js server starting - initializing MongoDB...');
      await testConnection();
      await connectMongoose();
      console.log('✅ Mongoose initialized on server startup');
    } catch (error) {
      console.error('⚠️  MongoDB connection will retry on first use');
    }
  }
}

