export default async function handler(req, res) {
    res.status(200).json({
        status: 'ok',
        service: 'chess-game-bot-detection',
        timestamp: new Date().toISOString()
    });
}
