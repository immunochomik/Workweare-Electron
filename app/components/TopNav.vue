
<template>
    <!-- Navigation -->
    <nav class="navbar navbar-default navbar-fixed-top">
        <div class="container-fluid">
            <div class="navbar-header">
                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="#">{{title}}</a>
            </div>
            <div id="navbar" class="navbar-collapse collapse">
                <ul class="nav navbar-nav navbar-right">
                    <li id="topNavLiWorkers" class="active nav-li"><router-link to="/workers">Workers</router-link></li>
                    <li id="topNavLiReleaseHistory" class="nav-li"><router-link to="/goods-out">Goods Out</router-link></li>
                    <li id="topNavLiGoodsIn" class="nav-li"><router-link to="/goods-in">Goods In</router-link></li>
                    <li id="topNavLiInventory" class="nav-li"><router-link to="/inventory">Inventory</router-link></li>
                    <li id="topNavLiWorkwearTypes" class="nav-li"><router-link to="/workweartypes">Workwear Types</router-link></li>
                    <li id="topNavLiWorkPositions" class="nav-li"><router-link to="/workpositions">Positions</router-link></li>
                    <li id="topNavLiToDo" class="nav-li"><router-link to="/todo">To Do</router-link></li>
                    <li id="topNavLiData" class="nav-li"><router-link to="/data">data</router-link></li>
                </ul>
            </div><!--/.nav-collapse -->
        </div><!--/.container-fluid -->
    </nav>
</template>

<script>
    export default {
        name: 'TopNav',
        methods: {
            toggleActive : function(id) {
              toggleTopNavActive(id);
            }
        },
        data : function () {
            return {
                title: 'Workwear'
            }
        }
    }
</script>

<style>
</style>
