def check_password_was_not_used_earlier(current_hash, previous_hashes):
    if not previous_hashes or not current_hash:
        return False
    hashes = previous_hashes.split(';')
    for current in hashes:
        if current_hash == current:
            return True
    return False

def check_list1_is_in_list2(list1, list2):
    for item in list1:
        if item not in list2:
            return False
    return True