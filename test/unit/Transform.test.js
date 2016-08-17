describe('engine test', function(){
  it('tests engine setup', function(){
    var assets = {
        background: "../../assets/background.png",
        defaultRing: "../../assets/blankring.png",
        stopSprite: "../../assets/stopring.png",
        startSprite: "../../assets/movering.png"
    }
    var buzz = new Junkpile.Engine(testEngine, assets);

    function testEngine(){
      chai.assert(buzz.objects.length !== 0, 'engine was created!');
    }
  });
});
