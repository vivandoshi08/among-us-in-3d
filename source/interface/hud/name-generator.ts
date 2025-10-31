export default function generateRandomName() {
    const prefixes = [
        "Thunder", "Blood", "Shadow", "Frost", "Doom", "Soul", "Nether", "Storm", "Iron", "Venom",
        "Dragon", "Night", "Blaze", "Dark", "Widow", "Skull", "Grim", "Hell", "Void", "Death",
        "Rune", "Black", "Crimson", "Ghost", "Ember", "Wraith", "Obsidian", "Dread", "Fire", "Ice"
    ];

    const suffixes = [
        "strike", "moon", "veil", "fang", "bringer", "reaper", "flame", "caller", "clad", "shade",
        "heart", "fury", "thorn", "maker", "crusher", "walker", "whisper", "claw", "storm", "blade",
        "bane", "flare", "forge", "rider", "jaw", "wind", "howl", "rage", "rend", "bite"
    ];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

    return `${prefix}${suffix}`;
};
