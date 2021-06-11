let PAGE = 'main';
let CANVAS_SIZE = 528;
let HP_SIZE = 24;
let HP_DISTANCE = 40;
let MAP_SIZE = 4;

let history;
let pos;
let cur_color;
let map = new Array(MAP_SIZE);

let head = get_image("assets/head.png");
let black_bg = get_image("assets/black_bg.png");
let white_bg = get_image("assets/white_bg.png");
let black_hp = get_image("assets/black_hp.png");
let white_hp = get_image("assets/white_hp.png");

let colors = ['black', 'white'];
let types = ['king', 'wizard', 'medic', 'shield', 'archer', 'knight'];

let assets = {black: {}, white: {}};

for (let color of colors) {
    for (let type of types) {
        assets[color][type] = get_image("assets/" + color + "_" + type + ".png")
    }
}


function switch_page(new_page) {
    document.getElementById("main").style.display='none';
    document.getElementById("faq").style.display='none';
    PAGE = new_page;
    document.getElementById(new_page).style.display='block';
}

function get_image(src) {
    let image = new Image();
    image.src = src;
    return image;
}

function generate() {
    let color = document.getElementById("color").value;
    let opponents_color = color === 'black' ? 'white' : 'black';
    let your_king = document.getElementById("your_king").value;
    let opponents_king = document.getElementById("opponents_king").value;
    let history = document.getElementById("history").value;

    pos = history.indexOf(' ');
    cur_color = 'black';

    for (let i = 0; i < MAP_SIZE; i++) {
        map[i] = new Array(MAP_SIZE);
        for (let j = 0; j < MAP_SIZE; j++)
            map[i][j] = {type: 'empty'}
    }

    let pieces_hp = {'king': 4, 'wizard': 3, 'medic': 3, 'shield': 4, 'archer': 3, 'knight': 3};
    let pieces_order_border = ['king', 'archer', 'medic', 'archer', 'shield', 'knight', 'knight', 'wizard'];
    let pieces_order_center = ['archer', 'king', 'medic', 'knight', 'knight', 'shield', 'wizard', 'archer'];
    for (let row = 0; row < MAP_SIZE; row++) {
        for (let column = 0; column < MAP_SIZE; column++) {
            let your_side = row < 2;
            let piece_color = your_side ? color : opponents_color;
            let piece_type;
            switch (your_side ? your_king : opponents_king) {
                case 'a1':
                    piece_type = pieces_order_border[column + row * MAP_SIZE];
                    break;
                case 'b1':
                    piece_type = pieces_order_center[column + row * MAP_SIZE];
                    break;
                case 'c1':
                    piece_type = pieces_order_center[(MAP_SIZE - column - 1) + row * MAP_SIZE];
                    break;
                case 'd1':
                    piece_type = pieces_order_border[(MAP_SIZE - column - 1) + row * MAP_SIZE];
                    break;
                case 'a4':
                    piece_type = pieces_order_border[column + (MAP_SIZE - row - 1) * MAP_SIZE];
                    break;
                case 'b4':
                    piece_type = pieces_order_center[column + (MAP_SIZE - row - 1) * MAP_SIZE];
                    break;
                case 'c4':
                    piece_type = pieces_order_center[(MAP_SIZE - column - 1) + (MAP_SIZE - row - 1) * MAP_SIZE];
                    break;
                case 'd4':
                    piece_type = pieces_order_border[(MAP_SIZE - column - 1) + (MAP_SIZE - row - 1) * MAP_SIZE];
                    break;
            }
            map[column][row] = {type: piece_type, color: piece_color, hp: pieces_hp[piece_type]};
        }
    }

    display_map(map);
}

function next() {
    let l2i = {a: 0, b: 1, c: 2, d: 3};
    let n2i = {1: 0, 2: 1, 3: 2, 4: 3};
    history = document.getElementById("history").value.replace(/!/gi, '').replace(/\?/gi, '');

    //switch
    let first = map[l2i[history[pos+1]]][n2i[history[pos+2]]];
    map[l2i[history[pos+1]]][n2i[history[pos+2]]] = map[l2i[history[pos+3]]][n2i[history[pos+4]]];
    map[l2i[history[pos+3]]][n2i[history[pos+4]]] = first;

    //action
    let next_pos = history.indexOf(' ', pos + 1);
    // handle lack of trailing space for only/last move
    next_pos = next_pos >= 0 ? next_pos : history.length - 1;
    if (next_pos !== pos + 5) {
        switch (history[pos + 5]) {
            case 'W':
                let w_col = 0;
                let w_row = 0;
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        if (map[i][j]['type'] === 'wizard' && map[i][j]['color'] === cur_color) {
                            w_col = i;
                            w_row = j;
                            break;
                        }
                    }
                }
                let wizard = map[w_col][w_row];
                map[w_col][w_row] = map[l2i[history[pos+7]]][n2i[history[pos+8]]];
                map[l2i[history[pos+7]]][n2i[history[pos+8]]] = wizard;
                break;
            case 'K':
            case 'A':
            case 'N':
                for (let i = pos + 7; i < next_pos; i += 2) {
                    map[l2i[history[i]]][n2i[history[i+1]]]['hp'] -= 1;
                    if (map[l2i[history[i]]][n2i[history[i+1]]]['hp'] === 0) {
                        map[l2i[history[i]]][n2i[history[i+1]]] = {type: 'empty', color: null, hp: null};
                    }
                }
                break;
            case 'M':
                for (let i = pos + 7; i < next_pos; i += 2) {
                    map[l2i[history[i]]][n2i[history[i+1]]]['hp'] += 1;
                }
                break;
        }
    }

    pos = next_pos;
    cur_color = (cur_color === 'black') ? 'white' : 'black';
    display_map(map);
}

function display_map(map) {
    let graphic_display = document.getElementById("graphic_display");
    graphic_display.width = graphic_display.width;
    let canvas = graphic_display.getContext("2d");

    let tile_width = CANVAS_SIZE / MAP_SIZE;
    let tile_height = CANVAS_SIZE / MAP_SIZE;
    let hp_size = HP_SIZE / 4;
    let hp_distance = HP_DISTANCE / 3;

    for (let row = 0; row < MAP_SIZE; row++) {
        for (let column = 0; column < MAP_SIZE; column++) {
            let piece = map[column][row];
            if (piece['type'] !== 'empty') {
                canvas.drawImage(piece['color'] === 'black' ? black_bg : white_bg,
                    column * tile_width, (MAP_SIZE - row - 1) * tile_height, tile_width, tile_height);
                if (piece['type'] !== 'shield') {
                    canvas.drawImage(head, column * tile_width, (3 - row) * tile_height, tile_width, tile_height);
                }
                canvas.drawImage(assets[piece['color']][piece['type']], column * tile_width, (MAP_SIZE - row - 1) * tile_height, tile_width, tile_height);
                let dot_asset = piece['color'] === 'black' ? black_hp : white_hp;
                let dot_height = (3 - row) * tile_height + tile_height / 9;
                let dot_count = map[column][row]['hp'];
                for (let i = 0; i < dot_count; i++) {
                    canvas.drawImage(dot_asset, column * tile_width + (tile_width - hp_size - hp_distance * (dot_count - 1)) / 2 + hp_distance * i, dot_height, hp_size, hp_size);
                }
            }
        }
    }
}