// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library ArrayUtils_uint256{

    function indexOf(uint256[] memory _arr, uint256 _id) public pure returns (int256){
        for(uint256 i = 0; i < _arr.length; i++){
            if(_arr[i] == _id){
                return int256(i);
            }
        }
        return -1;
    }

    function remove(uint256[] storage _arr, uint256 _index) internal {
        require(_index < _arr.length);
        _arr[_index] = _arr[_arr.length-1];
        _arr.pop();
    }

    function removeValue(uint256[] storage _arr, uint256 _value) internal returns (bool) {
        int256 index = indexOf(_arr, _value);
        if(index == -1) return false;
        remove(_arr, uint256(index));
        return true;
    }

}