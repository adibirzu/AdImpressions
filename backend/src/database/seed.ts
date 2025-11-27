import { db, initializeDatabase } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { parseVideoUrl } from '../utils/videoParser';

async function seedDatabase() {
  console.log('Starting database seeding...');

  // Initialize database schema first
  initializeDatabase();

  // Clear existing data
  console.log('Clearing existing data...');
  db.prepare('DELETE FROM analytics').run();
  db.prepare('DELETE FROM votes').run();
  db.prepare('DELETE FROM ads').run();
  db.prepare('DELETE FROM users').run();
  db.prepare('DELETE FROM weekly_archive').run();

  const now = new Date().toISOString();

  // Seed users
  console.log('Seeding users...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const adminId = uuidv4();
  const userId = uuidv4();

  db.prepare(`
    INSERT INTO users (id, username, email, password_hash, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(adminId, 'admin', 'admin@adimpressions.com', adminPassword, 'admin', now, now);

  db.prepare(`
    INSERT INTO users (id, username, email, password_hash, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, 'johndoe', 'john@example.com', userPassword, 'user', now, now);

  console.log('Created 2 users (admin/admin123, johndoe/user123)');

  // Seed ads with real YouTube and Vimeo advertising videos
  console.log('Seeding ads...');

  const sampleAds = [
    {
      title: 'Apple - iPhone 15 Pro',
      description: 'Titanium. So strong. So light. So Pro.',
      video_url: 'https://www.youtube.com/watch?v=xqyUdNxWazA',
      brand: 'Apple',
      category: 'Technology'
    },
    {
      title: 'Nike - You Can\'t Stop Us',
      description: 'The most powerful ad of 2020. Unity and diversity in sports.',
      video_url: 'https://www.youtube.com/watch?v=WA4dDs0T7sM',
      brand: 'Nike',
      category: 'Sports'
    },
    {
      title: 'Coca-Cola - Open Happiness',
      description: 'Classic Coca-Cola commercial spreading joy and happiness.',
      video_url: 'https://www.youtube.com/watch?v=IxXq28VljOs',
      brand: 'Coca-Cola',
      category: 'Beverages'
    },
    {
      title: 'Tesla Model 3 - Electric Cars',
      description: 'The future of sustainable transportation.',
      video_url: 'https://www.youtube.com/watch?v=zSjYra7cYqY',
      brand: 'Tesla',
      category: 'Automotive'
    },
    {
      title: 'Amazon - Alexa Loses Her Voice',
      description: 'Super Bowl commercial featuring celebrity voices.',
      video_url: 'https://www.youtube.com/watch?v=J6-8DQALGt4',
      brand: 'Amazon',
      category: 'Technology'
    },
    {
      title: 'Google - Year in Search 2023',
      description: 'A look back at the most searched moments of the year.',
      video_url: 'https://www.youtube.com/watch?v=6BqhT0ESchY',
      brand: 'Google',
      category: 'Technology'
    },
    {
      title: 'Airbnb - Made Possible by Hosts',
      description: 'Beautiful storytelling about unique stays around the world.',
      video_url: 'https://vimeo.com/283721369',
      brand: 'Airbnb',
      category: 'Travel'
    },
    {
      title: 'McDonald\'s - Famous Orders',
      description: 'Celebrities sharing their favorite McDonald\'s orders.',
      video_url: 'https://www.youtube.com/watch?v=3lVCJ04WS5E',
      brand: 'McDonald\'s',
      category: 'Food'
    },
    {
      title: 'BMW - The Hire',
      description: 'Iconic short film series featuring premium driving experience.',
      video_url: 'https://vimeo.com/59282790',
      brand: 'BMW',
      category: 'Automotive'
    },
    {
      title: 'Spotify - Wrapped 2023',
      description: 'Your year in music. Personalized and shareable.',
      video_url: 'https://www.youtube.com/watch?v=moEqYloND34',
      brand: 'Spotify',
      category: 'Entertainment'
    }
  ];

  const adIds: string[] = [];

  for (const ad of sampleAds) {
    const videoInfo = parseVideoUrl(ad.video_url);

    if (!videoInfo) {
      console.warn(`Skipping ad "${ad.title}" - invalid video URL`);
      continue;
    }

    const adId = uuidv4();
    adIds.push(adId);

    db.prepare(`
      INSERT INTO ads (
        id, title, description, video_url, video_platform, video_id,
        thumbnail_url, brand, category, status, total_votes, average_rating,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      adId,
      ad.title,
      ad.description,
      ad.video_url,
      videoInfo.platform,
      videoInfo.videoId,
      videoInfo.thumbnailUrl,
      ad.brand,
      ad.category,
      'active',
      0,
      0,
      now,
      now
    );
  }

  console.log(`Created ${adIds.length} ads`);

  // Seed some sample votes
  console.log('Seeding sample votes...');
  let votesCount = 0;

  for (const adId of adIds) {
    // Generate 5-15 random votes for each ad
    const numVotes = Math.floor(Math.random() * 11) + 5;

    for (let i = 0; i < numVotes; i++) {
      const voteId = uuidv4();
      const rating = Math.floor(Math.random() * 5) + 1; // 1-5
      const voteUserId = Math.random() > 0.5 ? userId : null;
      const voteDate = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();

      db.prepare(`
        INSERT INTO votes (id, ad_id, user_id, rating, user_ip, user_agent, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        voteId,
        adId,
        voteUserId,
        rating,
        `192.168.1.${Math.floor(Math.random() * 255)}`,
        'Mozilla/5.0 (Seeded Data)',
        voteDate
      );

      votesCount++;
    }

    // Update ad rating statistics
    const stats = db.prepare(`
      SELECT COUNT(*) as total_votes, AVG(rating) as average_rating
      FROM votes
      WHERE ad_id = ?
    `).get(adId) as { total_votes: number; average_rating: number };

    db.prepare(`
      UPDATE ads
      SET total_votes = ?, average_rating = ?
      WHERE id = ?
    `).run(
      stats.total_votes,
      Math.round(stats.average_rating * 100) / 100,
      adId
    );
  }

  console.log(`Created ${votesCount} sample votes`);

  // Seed some analytics events
  console.log('Seeding analytics events...');
  let analyticsCount = 0;

  const eventTypes = ['view', 'vote', 'share'] as const;

  for (const adId of adIds) {
    // Generate 10-30 random analytics events for each ad
    const numEvents = Math.floor(Math.random() * 21) + 10;

    for (let i = 0; i < numEvents; i++) {
      const eventId = uuidv4();
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const eventUserId = Math.random() > 0.6 ? userId : null;
      const eventDate = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();

      db.prepare(`
        INSERT INTO analytics (id, ad_id, event_type, user_id, user_ip, user_agent, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        eventId,
        adId,
        eventType,
        eventUserId,
        `192.168.1.${Math.floor(Math.random() * 255)}`,
        'Mozilla/5.0 (Seeded Data)',
        eventDate
      );

      analyticsCount++;
    }
  }

  console.log(`Created ${analyticsCount} analytics events`);

  console.log('='.repeat(50));
  console.log('Database seeding completed successfully!');
  console.log('='.repeat(50));
  console.log('Summary:');
  console.log(`- Users: 2 (admin, johndoe)`);
  console.log(`- Ads: ${adIds.length}`);
  console.log(`- Votes: ${votesCount}`);
  console.log(`- Analytics Events: ${analyticsCount}`);
  console.log('='.repeat(50));
  console.log('Login credentials:');
  console.log('Admin: admin@adimpressions.com / admin123');
  console.log('User: john@example.com / user123');
  console.log('='.repeat(50));
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding complete. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error seeding database:', error);
      process.exit(1);
    });
}

export default seedDatabase;
