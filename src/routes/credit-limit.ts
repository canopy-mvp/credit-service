export async function creditLimitRoutes(app: any) {
  app.post('/v1/credit-lines/:id/increase', async (req: any, reply: any) => {
    // TODO: implement limit increase
    return reply.status(202).send({ status: 'pending_review' });
  });
}
