export interface Player {
    id: string;
    name: string;
    image_id: number;
    cc: string | null;
}

export  interface League {
    id: string;
    name: string;
    cc: string | null;
}

export interface Match {
    id: string;
    sport_id: string;
    league: League;
    home: Player;
    away: Player;
    time: string;
    ss: string;
    time_status: string;
}

export interface MatchData {
    home: Match[];
}
