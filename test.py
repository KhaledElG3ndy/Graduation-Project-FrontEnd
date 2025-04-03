import pygame as pg
import sys
import time
from pygame.locals import *

pg.init()

WIDTH = 400
HEIGHT = 400 
SCOREBOARD_HEIGHT = 100
BACKGROUND = (255, 255, 255)
LINE_COLOR = (0, 0, 0)

screen = pg.display.set_mode((WIDTH, HEIGHT + SCOREBOARD_HEIGHT))
pg.display.set_caption("Tic Tac Toe")

FPS = 30
clock = pg.time.Clock()

current_player = 'x'
current_winner = None
is_draw = False
grid = [[None]*3 for _ in range(3)]

def game_initiating_window():
    screen.fill(BACKGROUND)
    pg.draw.line(screen, LINE_COLOR, (WIDTH/3, 0), (WIDTH/3, HEIGHT), 7)
    pg.draw.line(screen, LINE_COLOR, (2*WIDTH/3, 0), (2*WIDTH/3, HEIGHT), 7)
    pg.draw.line(screen, LINE_COLOR, (0, HEIGHT/3), (WIDTH, HEIGHT/3), 7)
    pg.draw.line(screen, LINE_COLOR, (0, 2*HEIGHT/3), (WIDTH, 2*HEIGHT/3), 7)
    draw_status()

def draw_status():
    global is_draw
    if current_winner is None:
        message = f"{current_player.upper()}'s Turn"
    else:
        message = f"{current_winner.upper()} won!"
    if is_draw:
        message = "Game Draw!"

    font = pg.font.Font(None, 30)
    text = font.render(message, True, (255, 255, 255))

    screen.fill((0, 0, 0), (0, HEIGHT, WIDTH, SCOREBOARD_HEIGHT))

    text_rect = text.get_rect(center=(WIDTH/2, HEIGHT + SCOREBOARD_HEIGHT/2))
    screen.blit(text, text_rect)
    pg.display.update()

def check_win():
    global current_winner, is_draw
    for row in range(3):
        if grid[row][0] == grid[row][1] == grid[row][2] and grid[row][0] is not None:
            current_winner = grid[row][0]
            pg.draw.line(screen, (250, 0, 0),
                         (0, (row + 0.5)*HEIGHT/3),
                         (WIDTH, (row + 0.5)*HEIGHT/3), 4)
            break
    for col in range(3):
        if grid[0][col] == grid[1][col] == grid[2][col] and grid[0][col] is not None:
            current_winner = grid[0][col]
            pg.draw.line(screen, (250, 0, 0),
                         ((col + 0.5)*WIDTH/3, 0),
                         ((col + 0.5)*WIDTH/3, HEIGHT), 4)
            break
    if grid[0][0] == grid[1][1] == grid[2][2] and grid[0][0] is not None:
        current_winner = grid[0][0]
        pg.draw.line(screen, (250, 0, 0), (50, 50), (350, 350), 4)
    if grid[0][2] == grid[1][1] == grid[2][0] and grid[0][2] is not None:
        current_winner = grid[0][2]
        pg.draw.line(screen, (250, 0, 0), (350, 50), (50, 350), 4)

    if all(all(row) for row in grid) and current_winner is None:
        is_draw = True

    draw_status()

def drawXO(row, col):
    global current_player
    pos_x = (row - 1) * (WIDTH / 3) + 30
    pos_y = (col - 1) * (HEIGHT / 3) + 30

    grid[row-1][col-1] = current_player

    if current_player == 'x':
        pg.draw.line(screen, (0, 0, 0), (pos_x, pos_y),
                     (pos_x + 80, pos_y + 80), 5)
        pg.draw.line(screen, (0, 0, 0), (pos_x, pos_y + 80),
                     (pos_x + 80, pos_y), 5)
        current_player = 'o'
    else:
        center = (pos_x + 40, pos_y + 40)
        pg.draw.circle(screen, (0, 0, 0), center, 40, 5)
        current_player = 'x'
    pg.display.update()

def user_click():
    x, y = pg.mouse.get_pos()
    if x < WIDTH/3:
        col = 1
    elif x < 2*WIDTH/3:
        col = 2
    else:
        col = 3

    if y < HEIGHT/3:
        row = 1
    elif y < 2*HEIGHT/3:
        row = 2
    elif y < HEIGHT:
        row = 3
    else:
        row = None

    if row and col and grid[row-1][col-1] is None:
        drawXO(row, col)
        check_win()

def reset_game():
    global grid, current_winner, current_player, is_draw
    time.sleep(10) 
    current_player = 'x'
    current_winner = None
    is_draw = False
    grid = [[None]*3 for _ in range(3)]
    game_initiating_window()

game_initiating_window()

running = True
while running:
    for event in pg.event.get():
        if event.type == pg.QUIT:
            pg.quit()
            sys.exit()
        elif event.type == pg.MOUSEBUTTONDOWN:
            user_click()
            if current_winner or is_draw:
                reset_game()

    pg.display.update()
    clock.tick(FPS)
