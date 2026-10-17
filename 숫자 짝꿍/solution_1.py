def solution(X, Y):
    answer = ''
    
    x = list(X)
    y = list(Y)
    x.sort(reverse=True)
    y.sort(reverse=True)
    
    l = []
    
    if set(x) & set(y) == set() :
        answer = "-1"
    else :
        for num_x in x :
            if num_x in y :
                y.remove(num_x)
                l.append(num_x)
        
        answer = "".join(l)
        if answer[0] == "0" and len(answer) > 1 :
            answer = "0"
        
    return answer