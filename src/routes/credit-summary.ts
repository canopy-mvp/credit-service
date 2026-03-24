import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function creditSummaryRoutes(app: any) {
  app.get('/v1/merchants/:id/credit-summary', async (req: any, reply: any) => {
    const merchant = await prisma.merchant.findUnique({
      where: { id: req.params.id },
      include: {
        creditLines: true,
        owner: { select: { name: true, email: true, phone: true, ssn: true } },
      },
    });
    if (!merchant) {
      return reply.status(404).send({ message: 'Merchant not found' });
    }
    return reply.send({ data: merchant });
  });
}
