const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLead() {
  try {
    const lead = await prisma.lead.findFirst({
      where: { id: 'cmigz169t000ji17scpvr9p7k' },
      select: { 
        id: true, 
        quoteType: true, 
        status: true,
        location: true 
      }
    });
    
    console.log('Database lead data:', JSON.stringify(lead, null, 2));
    
    const assignment = await prisma.leadAssignment.findFirst({
      where: { leadId: 'cmigz169t000ji17scpvr9p7k' },
      select: {
        id: true,
        leadId: true,
        installerId: true,
        assignedAt: true
      }
    });
    
    console.log('Lead assignment:', JSON.stringify(assignment, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLead();
