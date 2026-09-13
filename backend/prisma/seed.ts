import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rosterMission = await prisma.mission.upsert({
    where: { id: 'roster' },
    update: { name: 'Agent Roster', template: 'deep_research', prompt: 'HQ roster, not a real mission.' },
    create: {
      id: 'roster',
      name: 'Agent Roster',
      template: 'deep_research',
      prompt: 'HQ roster, not a real mission.',
      status: 'complete',
    },
  });

  const roster = [
    { role: 'researcher', name: 'Kai', avatar: 'scan', blurb: 'Gathers evidence, maps territory, pulls facts from the mission brief and prior findings.' },
    { role: 'analyst', name: 'Lyra', avatar: 'lens', blurb: 'Synthesises patterns, weighs evidence, quantifies confidence in every claim.' },
    { role: 'critic', name: 'Vex', avatar: 'judge', blurb: 'Adversarial reviewer. Attacks weak logic, finds blind spots, refuses to be polite.' },
    { role: 'synthesizer', name: 'Nova', avatar: 'core', blurb: 'Converges the swarm into a final verdict, findings, and risk report.' },
    { role: 'orchestrator', name: 'Swarm Core', avatar: 'hub', blurb: 'Coordinates agents, schedules turns, and keeps the mission on telemetry.' },
  ];
  for (const a of roster) {
    await prisma.agent.upsert({
      where: { id: `roster-${a.role}` },
      update: { name: a.name, avatar: a.avatar },
      create: { id: `roster-${a.role}`, missionId: rosterMission.id, name: a.name, avatar: a.avatar, role: a.role, status: 'idle' },
    });
  }
  console.log('seeded agent roster (host: %s)', rosterMission.id);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());