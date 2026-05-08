import prisma from "../src/lib/prisma";

(async () => {
  try {
    console.log("DATABASE_URL=", process.env.DATABASE_URL || "not set");
    const r = await prisma.settings.findMany({ take: 20 });
    console.log("settings count=", r.length);
    console.log(JSON.stringify(r, null, 2));
  } catch (e) {
    console.error("ERROR", e);
  } finally {
    await prisma.$disconnect();
  }
})();
