import { world, system } from "@minecraft/server";

// Itens que emitem luz e seus níveis (de 0 a 15)
const LIGHT_ITEMS = {
    "minecraft:torch": 14,
    "minecraft:soul_torch": 10,
    "minecraft:lantern": 15,
    "minecraft:glowstone": 15,
    "minecraft:shroomlight": 15
};

const playerLastLightPos = new Map();

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        try {
            const dimension = player.dimension;
            const pos = {
                x: Math.floor(player.location.x),
                y: Math.floor(player.location.y),
                z: Math.floor(player.location.z)
            };

            const equippable = player.getComponent("equippable");
            const mainhand = equippable?.getEquipment("Mainhand");
            const offhand = equippable?.getEquipment("Offhand");

            const mainId = mainhand?.typeId;
            const offId = offhand?.typeId;

            let lightLevel = 0;
            if (LIGHT_ITEMS[mainId]) lightLevel = LIGHT_ITEMS[mainId];
            else if (LIGHT_ITEMS[offId]) lightLevel = LIGHT_ITEMS[offId];

            const lastPos = playerLastLightPos.get(player.id);

            if (lightLevel > 0) {
                if (lastPos && (lastPos.x !== pos.x || lastPos.y !== pos.y || lastPos.z !== pos.z)) {
                    removeLight(dimension, lastPos);
                }

                const block = dimension.getBlock(pos);
                if (block && block.typeId === "minecraft:air") {
                    dimension.runCommand(`setblock ${pos.x} ${pos.y} ${pos.z} light_block[block_light_level=${lightLevel}]`);
                    playerLastLightPos.set(player.id, pos);
                }
            } else {
                if (lastPos) {
                    removeLight(dimension, lastPos);
                    playerLastLightPos.delete(player.id);
                }
            }
        } catch (e) {}
    }
}, 3);

function removeLight(dimension, pos) {
    try {
        const block = dimension.getBlock(pos);
        if (block && block.typeId.includes("light_block")) {
            dimension.runCommand(`setblock ${pos.x} ${pos.y} ${pos.z} air`);
        }
    } catch (e) {}
}
