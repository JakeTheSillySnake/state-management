export default function drawStatusText(ctx, input, player) {
    ctx.font = "40px Impact";
    ctx.fillText("Last input: " + input.lastKey, 20, 50);
    ctx.fillText("Active State: " + player.currentState.state, 600, 50)
}