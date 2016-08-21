describe('engine test', function(){
  it('tests engine setup', function(){
    var buzz = new Junkpile.Engine();
    chai.assert(buzz.objects.length !== 0, 'engine was created!');
  });
});
