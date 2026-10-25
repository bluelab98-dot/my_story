export async function onRequest(context) {
    // سطر التشخيص: يعرض لك هل المتغيرات موجودة أم لا
    return new Response(JSON.stringify({
        binId: context.env.BIN_ID ? "موجود" : "غير موجود",
        masterKey: context.env.MASTER_KEY ? "موجود" : "غير موجود",
        allEnvKeys: Object.keys(context.env)
    }), { headers: { "Content-Type": "application/json" } });
}
