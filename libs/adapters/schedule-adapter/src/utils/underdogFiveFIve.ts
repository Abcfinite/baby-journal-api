import * as fs from "fs";
import * as path from "path";

// Tree node types
type TreeNode = {
    feature?: string;
    threshold?: number;
    left?: TreeNode;
    right?: TreeNode;
    value?: number;
};

// Input features type
export interface MatchInput {
    odd_p1: number;
    odd_p2: number;
    h2h_p1: number;
    h2h_p2: number;
    l10_p1: number;
    l10_p2: number;
    p1_streak_encoded: number;
    p2_streak_encoded: number;
    p1_recent_win_rate: number;
    p2_recent_win_rate: number;
}

// Load forest model
// const forestPath = path.join(__dirname, "../../../../../../underdog_five_five_forest_model.json");
// const forest: TreeNode[] = JSON.parse(fs.readFileSync(forestPath, "utf-8"));

// Features used in the same order as model training
const FEATURE_NAMES: (keyof MatchInput)[] = [
    "odd_p1", "odd_p2",
    "h2h_p1", "h2h_p2",
    "l10_p1", "l10_p2",
    "p1_streak_encoded", "p2_streak_encoded",
    "p1_recent_win_rate", "p2_recent_win_rate"
];

// Recursively evaluate a single tree
function evaluateTree(tree: TreeNode, input: MatchInput): number {
    if ("value" in tree) return tree.value!;
    const featureValue = input[tree.feature as keyof MatchInput];
    return featureValue <= tree.threshold!
        ? evaluateTree(tree.left!, input)
        : evaluateTree(tree.right!, input);
}

// Predict underdog win probability
// export function predictUnderdogWin(input: MatchInput): number {
//     for (const feature of FEATURE_NAMES) {
//         if (!(feature in input)) {
//             throw new Error(`Missing feature: ${feature}`);
//         }
//     }

    // const probabilities = forest.map(tree => evaluateTree(tree, input));
    // return probabilities.reduce((sum, prob) => sum + prob, 0) / forest.length;
// }
