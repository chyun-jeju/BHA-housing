

import { User, UserRole, ServiceRequest, RequestCategory, RequestLocation, UrgencyLevel, RequestStatus } from '../types';

export const generateUserCode = () => `USR-${Math.floor(1000 + Math.random() * 9000)}`;

// Mock Users
export const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    userCode: 'USR-1001',
    name: 'Ji-Min Kim', 
    email: 'jimin.kim@branksome.asia', 
    role: UserRole.STAFF, 
    department: 'Science Dept', 
    avatarUrl: 'https://ui-avatars.com/api/?name=Ji+Min+Kim&background=random',
    isApproved: true,
    password: 'password',
    createdAt: new Date('2024-01-15').toISOString()
  },
  { 
    id: 'u2', 
    userCode: 'USR-2002',
    name: 'Chul-Soo Park', 
    email: 'park.cs@maintenance.com', 
    role: UserRole.WORKER, 
    avatarUrl: 'https://ui-avatars.com/api/?name=Chul+Soo+Park&background=random',
    isApproved: true,
    password: 'password',
    createdAt: new Date('2024-01-10').toISOString()
  },
  { 
    id: 'u3', 
    userCode: 'USR-0001',
    name: 'Chiho Yun', 
    email: 'chihoyun@branksome.asia', 
    role: UserRole.ADMIN, 
    avatarUrl: 'https://ui-avatars.com/api/?name=Chiho+Yun&background=0D8ABC&color=fff',
    isApproved: true,
    password: '12345678',
    createdAt: new Date('2024-01-01').toISOString()
  },
  { 
    id: 'u5', 
    userCode: 'USR-3005',
    name: 'Requester Test', 
    email: 'chihoyun2@branksome.asia', 
    role: UserRole.STAFF, 
    avatarUrl: 'https://ui-avatars.com/api/?name=Requester+Test&background=random',
    isApproved: true,
    password: '12345678',
    createdAt: new Date('2024-02-01').toISOString()
  },
  { 
    id: 'u6', 
    userCode: 'USR-4006',
    name: 'Worker Test', 
    email: 'chihoyun3@branksome.asia', 
    role: UserRole.WORKER, 
    avatarUrl: 'https://ui-avatars.com/api/?name=Worker+Test&background=random',
    isApproved: true,
    password: '12345678',
    createdAt: new Date('2024-02-01').toISOString()
  },
  { 
    id: 'u4', 
    userCode: 'USR-5001',
    name: 'New Teacher', 
    email: 'teacher@branksome.asia', 
    role: UserRole.STAFF, 
    avatarUrl: 'https://ui-avatars.com/api/?name=New+Teacher&background=random',
    isApproved: false, 
    password: 'password',
    createdAt: new Date().toISOString()
  },
];

// Mock Initial Requests
export const INITIAL_REQUESTS: ServiceRequest[] = [
  {
    id: 'req-101',
    requesterId: 'u1',
    requesterName: 'Ji-Min Kim',
    requesterEmail: 'jimin.kim@branksome.asia',
    title: 'AC unit leaking in Lab 2',
    description: 'The air conditioner in the science lab is dripping water onto the desks.',
    category: RequestCategory.MACHINERY,
    location: RequestLocation.STMEV,
    urgency: UrgencyLevel.HIGH,
    status: RequestStatus.PENDING,
    timeline: [{ status: RequestStatus.PENDING, timestamp: new Date(Date.now() - 86400000).toISOString() }],
    comments: [],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    beforeImageUrl: 'https://images.unsplash.com/photo-1581094794329-cd1361ddee26?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'req-102',
    requesterId: 'u1',
    requesterName: 'Ji-Min Kim',
    requesterEmail: 'jimin.kim@branksome.asia',
    assigneeId: 'u2',
    assigneeEmail: 'park.cs@maintenance.com',
    title: 'Projector broken',
    description: 'Projector in room 304 does not turn on.',
    category: RequestCategory.ELECTRIC,
    location: RequestLocation.SCHOOL_CENTER,
    urgency: UrgencyLevel.MEDIUM,
    status: RequestStatus.COMPLETED,
    timeline: [
      { status: RequestStatus.PENDING, timestamp: new Date(Date.now() - 172800000).toISOString() },
      { status: RequestStatus.COMPLETED, timestamp: new Date(Date.now() - 86400000).toISOString() }
    ],
    comments: [
        { id: 'c1', authorId: 'u2', authorName: 'Chul-Soo Park', text: 'I will check it tomorrow morning.', timestamp: new Date(Date.now() - 100000000).toISOString() },
        { id: 'c2', authorId: 'u1', authorName: 'Ji-Min Kim', text: 'Thank you! Please come before 9 AM.', timestamp: new Date(Date.now() - 99000000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    feedbackRating: 5,
    feedbackComment: "Fast service, thanks!",
    afterImageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'req-103',
    requesterId: 'u1',
    requesterName: 'Ji-Min Kim',
    requesterEmail: 'jimin.kim@branksome.asia',
    assigneeId: 'u2',
    assigneeEmail: 'park.cs@maintenance.com',
    title: 'Broken window latch',
    description: 'Window in the gym storage does not lock properly.',
    category: RequestCategory.REPAIR,
    location: RequestLocation.WELLNESS,
    urgency: UrgencyLevel.LOW,
    status: RequestStatus.IN_PROGRESS,
    timeline: [
      { status: RequestStatus.PENDING, timestamp: new Date(Date.now() - 40000000).toISOString() },
      { status: RequestStatus.IN_PROGRESS, timestamp: new Date(Date.now() - 3600000).toISOString() }
    ],
    comments: [],
    createdAt: new Date(Date.now() - 40000000).toISOString(),
  }
];

export const generateId = () => `req-${Math.floor(Math.random() * 10000)}`;

export const getStats = (requests: ServiceRequest[]) => {
  const total = requests.length;
  const pending = requests.filter(r => r.status === RequestStatus.PENDING).length;
  const completed = requests.filter(r => r.status === RequestStatus.COMPLETED).length;
  
  // Calculate average completion time (mock calculation)
  const completedReqs = requests.filter(r => r.status === RequestStatus.COMPLETED);
  const totalDuration = completedReqs.reduce((acc, curr) => {
    const start = new Date(curr.createdAt).getTime();
    const endEvent = curr.timeline.find(t => t.status === RequestStatus.COMPLETED);
    const end = endEvent ? new Date(endEvent.timestamp).getTime() : Date.now();
    return acc + (end - start);
  }, 0);
  
  const avgHours = completedReqs.length ? (totalDuration / completedReqs.length / (1000 * 60 * 60)) : 0;

  // Category Breakdown
  const cats = requests.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryBreakdown = Object.entries(cats).map(([name, value]) => ({ name, value }));

  return { total, pending, completed, avgCompletionTimeHours: Math.round(avgHours * 10) / 10, categoryBreakdown };
};