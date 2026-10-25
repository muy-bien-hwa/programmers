# 택배 상자 수 = n, 가로로 놓은 상자 수 = w, 꺼내려는 택배 상자 번호 = num
# 꺼내려는 택배를 포함해서 총 몇 개의 상자를 꺼내야 할 지 반환해야 함

# 로직대로 큐 전체를 만들 필요는 없고 그냥 규칙 찾아서 계산하면 될 것 같다.
# 규칙대로 해당 열만 만들고 그 중에서 num이 몇번째인지만 계산
# ex) n=22, w=6, num=2 -> (6*0 + 2), (6*1 + (6-2+1)), (6*2 + 2), (6*3 + (6-2+1)) ...
# ex) n=22, w=6, num=3 -> (6*0 + 3), (6*1 + (6-3+1)), (6*2 + 3), (6*3 + (6-3+1)) ...
# 즉, num 이 있는 칸 열의 번호 규칙은
# w * col + bottom_num (col = 짝수)
# w * col + (w - bottom_num + 1) (col = 홀수)
# ex) n=13, w=3, num=11 -> (3*0 + 2), (3*1 + (3-2+1)), (3*2 + 2) ...

from collections import deque

def solution(n, w, num):
    q = deque()
    order = 0
    col = 0  # 아래서 몇번째인지, 0이면 제일 아래.

    row = (num - 1) // w   # num 이 있는 줄
    if row % 2 == 0 :
        bottom_num = num - w * row   # num 이 있는 줄 제일 아래 번호
    else :
        bottom_num = w * row + w + 1 - num

    # print (bottom_num)
    
    while True :   # num 이 있는 칸 열 -> stack 으로 만들기
        if col % 2 == 0:
            order = w * col + bottom_num
        else:
            order = w * col + (w - bottom_num + 1)

        if order > n: break

        q.append(order)
        col += 1

    # print(q)

    for _ in range(len(q)) :
        if q.popleft() == num :
            break
    
    return len(q) + 1



# ### Test
# print(solution(22, 6, 8))   # 3
# print(solution(13, 3, 6))   # 4