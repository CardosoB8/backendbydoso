import asyncio
import random
import datetime
from telegram import Bot, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.constants import ParseMode

TOKEN = "7832075741:AAHeCQygDPmC_AJ2yljZR57874pkKp4hL0I"
CHANNEL_ID = "@iahackeraviator"
AVIATOR_IMAGE = "https://imgur.com/a/kqAxdzi"
LINK_CANAL = "https://record.elephantbet.com/_rhoOOvBxBOAWqcfzuvZcQGNd7ZgqdRLk/1/"

bot = Bot(token=TOKEN)

contador_roxo = 0
contador_rosa = 0

# Teclado otimizado (cacheado)
teclado = InlineKeyboardMarkup([
    [InlineKeyboardButton("✅ Jogue Aqui para Me Acompanhar", url=LINK_CANAL)]
])

async def enviar_mensagem_rapida(texto, imagem=None):
    """Versão otimizada do envio de mensagens"""
    mensagem = f"<b>🛩️ IA Hacker Aviator</b>\n{texto}"
    try:
        if imagem:
            await bot.send_photo(
                chat_id=CHANNEL_ID,
                photo=imagem,
                caption=mensagem,
                parse_mode=ParseMode.HTML,
                reply_markup=teclado
            )
        else:
            await bot.send_message(
                chat_id=CHANNEL_ID,
                text=mensagem,
                parse_mode=ParseMode.HTML,
                reply_markup=teclado,
                disable_notification=True  # Reduz interrupções
            )
    except Exception as e:
        print(f"Erro no envio: {e}")

async def analise_rapida():
    """Versão simplificada da análise"""
    return f"""
    🧠 <b>Análise Instantânea</b> (v3.1)
    ┏━━━━━━━━━━━━━━━━
    ┃🔍 Padrão: {'🟣'*random.randint(2,4)}
    ┃📈 Tendência: {random.randint(75,95)}%
    ┗━━━━━━━━━━━━━━━━
    """

async def gerar_sinal():
    global contador_roxo, contador_rosa
    
    # Processamento paralelo
    analise_task = asyncio.create_task(analise_rapida())
    await asyncio.sleep(0.5)  # Tempo mínimo entre mensagens
    
    escolha = random.choices(["roxo", "rosa"], weights=[80, 20])[0]
    
    if escolha == "roxo":
        contador_roxo += 1
        sinal = f"""
        🚨 <b>VELA ROXO🟣</b>
        ⏱ {datetime.datetime.now().strftime("%H:%M:%S")}
        🎯 Alvo: {random.randint(3,6)}x
        🛡 Proteção: {random.uniform(2.0,3.0):.1f}x
        """
    else:
        contador_rosa += 1
        sinal = f"""
        💎 <b>VELA ROSA🌹</b>
        ⏱ {datetime.datetime.now().strftime("%H:%M:%S")}
        🎯 Alvo: {random.randint(8,15)}x
        🛡 Proteção: {random.uniform(4.0,6.0):.1f}x
        """
    
    # Envio paralelo de análise + sinal
    await analise_task
    await enviar_mensagem_rapida(sinal, AVIATOR_IMAGE)
    
    # Atualização de status sem delay
    placar = f"""
    📊 🌹🟣<b>PlACAR DO DIA🟣🌹</b>
    Roxo: {contador_roxo} | Rosa: {contador_rosa}
    Próxima análise: {datetime.datetime.now().minute + 2}min
    """
    await enviar_mensagem_rapida(placar)

async def ciclo_otimizado():
    """Ciclo principal com timing ajustado"""
    while True:
        await gerar_sinal()
        await asyncio.sleep(150)  # 2.5 minutos entre ciclos

async def main():
    print("⚡ Bot em Operação Rápida")
    await enviar_mensagem_rapida("🚀 IA Ativada - Modo Turbo")
    await ciclo_otimizado()

if __name__ == "__main__":
    asyncio.run(main())